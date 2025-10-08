/**
 * Migration script to generate embeddings for existing services
 * Run this script to populate embeddings for services that don't have them
 */

import { PrismaClient } from '@prisma/client';
import { embeddingService } from '../dist/src/services/embedding.service.js';

const prisma = new PrismaClient();

async function generateMissingEmbeddings() {
  console.log('🚀 Starting migration: Generate missing embeddings for services');
  console.log('================================================');

  try {
    // Get count of services without embeddings
    const totalServicesWithoutEmbeddings = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Service" 
      WHERE "combinedEmbedding" IS NULL 
      AND "isActive" = true
    `;

    const totalCount = parseInt(totalServicesWithoutEmbeddings[0].count);
    console.log(`📊 Found ${totalCount} services without embeddings`);

    if (totalCount === 0) {
      console.log('✅ All active services already have embeddings!');
      return;
    }

    console.log('⚠️  This process will take time due to API rate limits (15 requests/minute)');
    console.log(`⏱️  Estimated time: ${Math.ceil((totalCount * 5) / 60)} minutes\n`);

    const batchSize = 10; // Process in small batches
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    while (processedCount < totalCount) {
      console.log(`\n📦 Processing batch ${Math.floor(processedCount / batchSize) + 1}...`);
      
      // Get next batch of services without embeddings
      const services = await prisma.$queryRaw`
        SELECT id, title, description, tags 
        FROM "Service" 
        WHERE "combinedEmbedding" IS NULL 
        AND "isActive" = true 
        ORDER BY "createdAt" DESC
        LIMIT ${batchSize}
      `;

      if (services.length === 0) {
        console.log('🎉 No more services to process!');
        break;
      }

      // Process each service in the batch
      for (let i = 0; i < services.length; i++) {
        const service = services[i];
        processedCount++;

        try {
          console.log(`\n⏳ [${processedCount}/${totalCount}] Processing: "${service.title || 'Untitled Service'}"`);
          console.log(`   Service ID: ${service.id}`);

          // Generate embeddings
          const embeddings = await embeddingService.generateServiceEmbeddings({
            title: service.title || '',
            description: service.description || '',
            tags: service.tags || []
          });

          // Convert embeddings to vector format strings
          const titleVector = `[${embeddings.titleEmbedding.join(',')}]`;
          const descriptionVector = `[${embeddings.descriptionEmbedding.join(',')}]`;
          const tagsVector = `[${embeddings.tagsEmbedding.join(',')}]`;
          const combinedVector = `[${embeddings.combinedEmbedding.join(',')}]`;

          console.log(`   📐 Vector dimensions: ${embeddings.combinedEmbedding.length}`);

          // Update service with embeddings
          await prisma.$executeRaw`
            UPDATE "Service" 
            SET 
              "titleEmbedding" = ${titleVector}::vector,
              "descriptionEmbedding" = ${descriptionVector}::vector,
              "tagsEmbedding" = ${tagsVector}::vector,
              "combinedEmbedding" = ${combinedVector}::vector,
              "embeddingUpdatedAt" = NOW()
            WHERE id = ${service.id}
          `;

          successCount++;
          console.log(`   ✅ Success! Embeddings generated and saved.`);

          // Rate limiting: Wait 5 seconds between requests for free tier
          if (processedCount < totalCount) {
            console.log(`   ⏱️  Waiting 5 seconds (rate limit)...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
          }

        } catch (error) {
          errorCount++;
          console.error(`   ❌ Failed to process service ${service.id}:`);
          console.error(`   Error: ${error.message}`);
          
          // If it's a rate limit error, wait longer
          if (error.message.includes('Daily API limit reached')) {
            console.log('🚫 Daily API limit reached. Stopping migration.');
            console.log('💡 Please run this script again tomorrow to continue.');
            break;
          }
          
          // Continue with next service for other errors
          continue;
        }
      }

      // Progress update
      const remainingCount = totalCount - processedCount;
      const estimatedTimeRemaining = Math.ceil((remainingCount * 5) / 60);
      
      console.log(`\n📈 Progress: ${processedCount}/${totalCount} services processed`);
      console.log(`✅ Successful: ${successCount} | ❌ Failed: ${errorCount}`);
      
      if (remainingCount > 0) {
        console.log(`⏱️  Estimated time remaining: ${estimatedTimeRemaining} minutes`);
      }
    }

    console.log('\n================================================');
    console.log('🎉 Migration completed!');
    console.log(`📊 Total services processed: ${processedCount}`);
    console.log(`✅ Successfully updated: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📈 Success rate: ${((successCount / processedCount) * 100).toFixed(1)}%`);

    if (errorCount > 0) {
      console.log('\n💡 Tip: You can run this script again to retry failed services.');
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if service is ready
async function checkPrerequisites() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');

    // Check if pgvector extension is available
    const pgvectorCheck = await prisma.$queryRaw`
      SELECT * FROM pg_extension WHERE extname = 'vector'
    `;
    
    if (pgvectorCheck.length === 0) {
      throw new Error('pgvector extension is not installed in the database');
    }
    console.log('✅ pgvector extension is available');

    // Test embedding service
    const testEmbedding = await embeddingService.generateEmbedding('test');
    if (!testEmbedding || testEmbedding.length === 0) {
      throw new Error('Embedding service is not working properly');
    }
    console.log('✅ Embedding service is working');
    console.log(`📏 Embedding dimension: ${testEmbedding.length}`);

    return true;
  } catch (error) {
    console.error('❌ Prerequisites check failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking prerequisites...');
  
  const prerequisitesOk = await checkPrerequisites();
  if (!prerequisitesOk) {
    console.log('\n💡 Please fix the issues above before running the migration.');
    process.exit(1);
  }

  console.log('\n✅ All prerequisites met. Starting migration...\n');
  
  // Ask for confirmation in production
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  You are running this in PRODUCTION mode.');
    console.log('🚨 This will modify the database and use API quota.');
    console.log('💰 Make sure you have sufficient API quota for the Gemini embedding service.');
    console.log('\nPress Ctrl+C to cancel, or wait 10 seconds to continue...');
    
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  await generateMissingEmbeddings();
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Migration interrupted by user');
  console.log('💾 Any completed embeddings have been saved to the database');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Migration terminated');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the migration
main().catch(async (error) => {
  console.error('💥 Unexpected error:', error);
  await prisma.$disconnect();
  process.exit(1);
});