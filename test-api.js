import axios from 'axios';

async function testServiceAPI() {
  try {
    console.log('Testing services API...');
    const response = await axios.get('http://localhost:3000/api/services?isActive=true&take=20');
    
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log(`✅ API working! Found ${response.data.data.length} services`);
    } else {
      console.log('❌ API returned success=false');
    }
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testServiceAPI();
