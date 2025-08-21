#!/usr/bin/env node

/**
 * Performance Test Script
 * Tests the optimized backend endpoints for speed and efficiency
 */

const API_BASE = 'http://localhost:3000/api';

async function testEndpoint(endpoint, description) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    const data = await response.json();
    const responseTime = Date.now() - startTime;
    
    console.log(`✅ ${description}: ${responseTime}ms`);
    
    if (response.headers.get('X-Response-Time')) {
      console.log(`   Server-side time: ${response.headers.get('X-Response-Time')}`);
    }
    
    return { success: true, responseTime, data };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ ${description}: ${responseTime}ms - Error: ${error.message}`);
    return { success: false, responseTime, error: error.message };
  }
}

async function runPerformanceTests() {
  console.log('🚀 Starting Backend Performance Tests...\n');
  
  const tests = [
    { endpoint: '/health', description: 'Health Check' },
    { endpoint: '/health/database', description: 'Database Health Check' },
    { endpoint: '/services?take=10', description: 'Get Services (10 items)' },
    { endpoint: '/services?take=20', description: 'Get Services (20 items)' },
    { endpoint: '/categories', description: 'Get Categories' },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.endpoint, test.description);
    results.push({ ...test, ...result });
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 Performance Summary:');
  console.log('========================');
  
  let totalTime = 0;
  let successCount = 0;
  
  results.forEach(result => {
    totalTime += result.responseTime;
    if (result.success) successCount++;
    
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.description}: ${result.responseTime}ms`);
  });
  
  console.log('\n📈 Overall Statistics:');
  console.log(`Total Tests: ${results.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${results.length - successCount}`);
  console.log(`Average Response Time: ${Math.round(totalTime / results.length)}ms`);
  console.log(`Total Time: ${totalTime}ms`);
  
  // Test caching effectiveness
  console.log('\n🎯 Testing Cache Performance:');
  console.log('First request (cold cache):');
  const coldTest = await testEndpoint('/services?take=5', 'Services (Cold Cache)');
  
  console.log('Second request (warm cache):');
  const warmTest = await testEndpoint('/services?take=5', 'Services (Warm Cache)');
  
  if (coldTest.success && warmTest.success) {
    const improvement = ((coldTest.responseTime - warmTest.responseTime) / coldTest.responseTime * 100).toFixed(1);
    console.log(`Cache improvement: ${improvement}% faster (${coldTest.responseTime}ms → ${warmTest.responseTime}ms)`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceTests().catch(console.error);
}

export { runPerformanceTests };
