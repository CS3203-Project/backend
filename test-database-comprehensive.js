import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function comprehensiveTest() {
  console.log('🔍 Starting comprehensive database diagnostics...\n');
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const connectionTime = Date.now() - startTime;
    console.log(`✅ Basic connection successful (${connectionTime}ms)\n`);
    
    // Test 2: Test specific findUnique operation that was failing
    console.log('2. Testing user.findUnique operation...');
    const findUniqueStart = Date.now();
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    const findUniqueTime = Date.now() - findUniqueStart;
    console.log(`✅ user.findUnique completed (${findUniqueTime}ms)`);
    console.log(`   Result: ${testUser ? 'User found' : 'User not found'}\n`);
    
    // Test 3: Multiple rapid queries to test connection stability
    console.log('3. Testing connection stability with multiple queries...');
    const rapidTestStart = Date.now();
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(prisma.user.count());
    }
    await Promise.all(promises);
    const rapidTestTime = Date.now() - rapidTestStart;
    console.log(`✅ Multiple rapid queries completed (${rapidTestTime}ms)\n`);
    
    // Test 4: Database server info
    console.log('4. Checking database server information...');
    const serverInfo = await prisma.$queryRaw`SELECT version()`;
    console.log(`✅ Database server info:`, serverInfo[0]?.version || 'Unknown');
    
    // Test 5: Connection pool info
    console.log('\n5. Testing connection under load...');
    const loadTestStart = Date.now();
    const loadPromises = [];
    for (let i = 0; i < 10; i++) {
      loadPromises.push(
        prisma.user.findMany({ take: 1 })
      );
    }
    await Promise.all(loadPromises);
    const loadTestTime = Date.now() - loadTestStart;
    console.log(`✅ Load test completed (${loadTestTime}ms)\n`);
    
    console.log('🎉 All database tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    
    // Additional network diagnostics
    if (error.message.includes("Can't reach database server")) {
      console.log('\n🔍 Network troubleshooting suggestions:');
      console.log('1. Check if your internet connection is stable');
      console.log('2. Verify AWS RDS instance is running and accessible');
      console.log('3. Check security group settings (port 5432 should be open)');
      console.log('4. Verify the database URL in .env file');
      console.log('5. Check if there are any firewall restrictions');
    }
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveTest();
