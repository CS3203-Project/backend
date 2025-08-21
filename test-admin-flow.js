// Test script for Admin Creation and Provider Verification
// Run this with: node test-admin-flow.js

const apiBase = 'http://localhost:3000/api';

// Sample data
const adminData = {
  firstName: "System",
  lastName: "Administrator", 
  email: "admin@zia.com",
  password: "AdminPass123!",
  location: "Head Office",
  phone: "12345678901"
};

const userData = {
  firstName: "John",
  lastName: "Provider",
  email: "johnprovider@example.com",
  password: "Provider123!",
  phone: "09876543210"
};

const providerData = {
  bio: "Professional plumber with 10+ years experience",
  skills: ["Plumbing", "Pipe Installation", "Leak Repair"],
  qualifications: ["Certified Plumber", "Licensed Professional"],
  IDCardUrl: "https://example.com/uploads/johnprovider-id.jpg"
};

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${apiBase}${endpoint}`, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${result.message || result.error}`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ API call failed: ${method} ${endpoint}`);
    console.error(`   Error: ${error.message}`);
    throw error;
  }
}

async function testCompleteFlow() {
  console.log('🚀 Starting Admin Creation and Provider Verification Test\n');

  try {
    // Step 1: Create Initial Admin
    console.log('📝 Step 1: Creating initial admin...');
    console.log('   Request:', JSON.stringify(adminData, null, 2));
    
    const adminResult = await apiCall('/admin/initial-admin', 'POST', adminData);
    console.log('✅ Admin created successfully!');
    console.log('   Response:', JSON.stringify(adminResult, null, 2));

    // Step 2: Login as Admin
    console.log('\n📝 Step 2: Logging in as admin...');
    const loginData = { email: adminData.email, password: adminData.password };
    console.log('   Request:', JSON.stringify(loginData, null, 2));
    
    const adminLogin = await apiCall('/users/login', 'POST', loginData);
    console.log('✅ Admin login successful!');
    console.log('   JWT Token:', adminLogin.token.substring(0, 50) + '...');
    const adminToken = adminLogin.token;

    // Step 3: Create Regular User
    console.log('\n📝 Step 3: Creating regular user...');
    console.log('   Request:', JSON.stringify(userData, null, 2));
    
    const userResult = await apiCall('/users/register', 'POST', userData);
    console.log('✅ User created successfully!');
    console.log('   User ID:', userResult.user.id);

    // Step 4: Login as User
    console.log('\n📝 Step 4: Logging in as user...');
    const userLoginData = { email: userData.email, password: userData.password };
    
    const userLogin = await apiCall('/users/login', 'POST', userLoginData);
    console.log('✅ User login successful!');
    const userToken = userLogin.token;

    // Step 5: Create Provider Profile
    console.log('\n📝 Step 5: Creating service provider profile...');
    console.log('   Request:', JSON.stringify(providerData, null, 2));
    
    const providerResult = await apiCall('/providers/', 'POST', providerData, userToken);
    console.log('✅ Service provider created successfully!');
    console.log('   Provider ID:', providerResult.provider.id);
    console.log('   Verified Status:', providerResult.provider.isVerified);
    const providerId = providerResult.provider.id;

    // Step 6: Verify Provider using Admin Token
    console.log('\n📝 Step 6: Verifying service provider...');
    console.log('   Using Admin Token to verify Provider ID:', providerId);
    
    const verifyResult = await apiCall(`/providers/${providerId}/verify`, 'PUT', null, adminToken);
    console.log('✅ Service provider verified successfully!');
    console.log('   Verified Status:', verifyResult.provider.isVerified);

    // Step 7: Create Another Admin
    console.log('\n📝 Step 7: Creating another admin user...');
    const newAdminData = {
      firstName: "Sarah",
      lastName: "Manager",
      email: "sarah.manager@zia.com",
      password: "Manager123!",
      location: "Branch Office",
      phone: "11223344556"
    };
    console.log('   Request:', JSON.stringify(newAdminData, null, 2));
    
    const newAdminResult = await apiCall('/users/admin', 'POST', newAdminData, adminToken);
    console.log('✅ Second admin created successfully!');
    console.log('   Admin ID:', newAdminResult.admin.id);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   ✅ Initial Admin: ${adminResult.admin.email} (${adminResult.admin.id})`);
    console.log(`   ✅ Regular User: ${userResult.user.email} (${userResult.user.id})`);
    console.log(`   ✅ Service Provider: ${providerResult.provider.id} (Verified: ${verifyResult.provider.isVerified})`);
    console.log(`   ✅ Second Admin: ${newAdminResult.admin.email} (${newAdminResult.admin.id})`);

  } catch (error) {
    console.error('\n💥 Test failed!');
    console.error('Error:', error.message);
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ or you need to install node-fetch');
  console.log('💡 Alternative: Use the cURL commands in SAMPLE_JSON_EXAMPLES.md');
  process.exit(1);
}

testCompleteFlow();
