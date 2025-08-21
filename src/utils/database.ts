import { PrismaClient } from '@prisma/client';

// Singleton Prisma client to prevent multiple instances
class DatabaseManager {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new PrismaClient({
        log: ['warn', 'error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });

      // Handle graceful shutdown
      process.on('beforeExit', async () => {
        await DatabaseManager.instance.$disconnect();
      });

      process.on('SIGINT', async () => {
        await DatabaseManager.instance.$disconnect();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await DatabaseManager.instance.$disconnect();
        process.exit(0);
      });
    }

    return DatabaseManager.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseManager.instance) {
      await DatabaseManager.instance.$disconnect();
    }
  }
}

// Export the singleton instance
export const prisma = DatabaseManager.getInstance();

// Test connection with retry logic
async function connectWithRetry(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log(`✅ Connected to database on attempt ${attempt}`);
      return;
    } catch (error: any) {
      console.log(`❌ Connection attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Retrying in ${waitTime/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

export { connectWithRetry };
