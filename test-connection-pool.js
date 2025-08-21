import { prisma } from './dist/src/utils/database.js';
import { ConnectionPoolMonitor } from './dist/src/utils/connection-monitor.js';

async function testConnectionPool() {
  console.log('🔍 Testing connection pool with multiple concurrent operations...\n');
  
  try {
    // Start monitoring
    ConnectionPoolMonitor.startMonitoring(5000); // Monitor every 5 seconds
    
    // Test 1: Multiple concurrent reads
    console.log('Test 1: Multiple concurrent findMany operations');
    const startTime1 = Date.now();
    const promises1 = Array.from({ length: 15 }, (_, i) => 
      prisma.user.findMany({ take: 1 })
    );
    await Promise.all(promises1);
    console.log(`✅ 15 concurrent findMany operations completed in ${Date.now() - startTime1}ms\n`);
    
    // Test 2: Mixed operations
    console.log('Test 2: Mixed database operations');
    const startTime2 = Date.now();
    const promises2 = [
      prisma.user.count(),
      prisma.service.findMany({ take: 5 }),
      prisma.category.findMany({ take: 3 }),
      prisma.serviceProvider.count(),
      prisma.user.findUnique({ where: { email: 'test@example.com' } }),
      prisma.service.count(),
      prisma.user.findMany({ take: 2 }),
      prisma.category.count(),
    ];
    await Promise.all(promises2);
    console.log(`✅ Mixed operations completed in ${Date.now() - startTime2}ms\n`);
    
    // Test 3: Sequential operations to simulate normal usage
    console.log('Test 3: Sequential operations');
    const startTime3 = Date.now();
    for (let i = 0; i < 10; i++) {
      await prisma.user.findMany({ take: 1 });
    }
    console.log(`✅ 10 sequential operations completed in ${Date.now() - startTime3}ms\n`);
    
    // Get final connection stats
    const stats = await ConnectionPoolMonitor.getConnectionStats();
    console.log('📊 Final Connection Pool Stats:');
    console.log(`   Active connections: ${stats.activeConnections}`);
    console.log(`   Idle connections: ${stats.idleConnections}`);
    console.log(`   Total connections: ${stats.totalConnections}`);
    
    // Stop monitoring
    ConnectionPoolMonitor.stopMonitoring();
    
    console.log('\n🎉 All connection pool tests passed!');
    
  } catch (error) {
    console.error('❌ Connection pool test failed:', error);
    ConnectionPoolMonitor.stopMonitoring();
  }
}

testConnectionPool();
