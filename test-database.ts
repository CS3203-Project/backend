import { PrismaClient } from '@prisma/client';
import * as pg from 'pg';

const prisma = new PrismaClient();

async function testRawConnection() {
  const connectionString = process.env.DATABASE_URL;
  console.log('Testing raw PostgreSQL connection...');
  console.log('Connection string:', connectionString?.replace(/:[^:@]+@/, ':****@'));

  const client = new pg.Client({
    connectionString: connectionString?.replace('?sslmode=require', ''),
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log('✅ Raw PostgreSQL connection successful!');
    
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0].version);
    
    await client.end();
  } catch (error) {
    console.error('❌ Raw PostgreSQL connection failed:', error.message);
    return false;
  }
  return true;
}

async function testPrismaConnection() {
  try {
    console.log('\nTesting Prisma connection...');
    await prisma.$connect();
    console.log('✅ Prisma connection successful!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Test query result:', result);
    
    return true;
  } catch (error) {
    console.error('❌ Prisma connection failed:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function testDatabaseConnection() {
  console.log('=== Database Connection Test ===\n');
  
  const rawSuccess = await testRawConnection();
  if (rawSuccess) {
    await testPrismaConnection();
  }
  
  console.log('\n=== Test Complete ===');
}

testDatabaseConnection();
