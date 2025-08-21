import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testVerificationAPI() {
  try {
    console.log('🔄 Testing Provider Verification API...\n');

    // Get all service providers to see their verification status
    const providers = await prisma.serviceProvider.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });

    if (providers.length === 0) {
      console.log('❌ No service providers found in the database');
      console.log('💡 Create a service provider first using the API');
      return;
    }

    console.log('📋 Current Service Providers:');
    providers.forEach((provider, index) => {
      console.log(`${index + 1}. ID: ${provider.id}`);
      console.log(`   User: ${provider.user.firstName} ${provider.user.lastName} (${provider.user.email})`);
      console.log(`   Verified: ${provider.isVerified ? '✅ Yes' : '❌ No'}`);
      console.log('');
    });

    console.log('🚀 API Endpoints Created:');
    console.log('1. PUT /api/providers/:id/verify   - Verify a provider (Admin only)');
    console.log('2. PUT /api/providers/:id/unverify - Unverify a provider (Admin only)');
    console.log('');
    console.log('📝 Example API Usage:');
    console.log('');
    console.log('// Verify a provider');
    console.log('PUT /api/providers/' + (providers[0]?.id || 'PROVIDER_ID') + '/verify');
    console.log('Headers: { Authorization: "Bearer ADMIN_JWT_TOKEN" }');
    console.log('');
    console.log('// Unverify a provider');
    console.log('PUT /api/providers/' + (providers[0]?.id || 'PROVIDER_ID') + '/unverify');
    console.log('Headers: { Authorization: "Bearer ADMIN_JWT_TOKEN" }');
    console.log('');
    console.log('📋 Response Format:');
    console.log('{');
    console.log('  "message": "Service provider verified successfully",');
    console.log('  "provider": {');
    console.log('    "id": "...",');
    console.log('    "isVerified": true,');
    console.log('    "user": { ... }');
    console.log('  }');
    console.log('}');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testVerificationAPI();
