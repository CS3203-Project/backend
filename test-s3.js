// Test S3 Connection Script
// Run this after fixing permissions to test if S3 works

import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'eu-north-1'
});

async function testS3Connection() {
  try {
    console.log('Testing S3 connection...');
    console.log('Bucket:', process.env.AWS_S3_BUCKET_NAME);
    console.log('Region:', process.env.AWS_REGION);
    
    // Test listing bucket contents
    const listResult = await s3.listObjectsV2({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      MaxKeys: 1
    }).promise();
    
    console.log('✅ S3 connection successful!');
    console.log('Bucket contents count:', listResult.KeyCount);
    
    // Test putting a small test object
    const testKey = 'test-permissions.txt';
    await s3.putObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: testKey,
      Body: 'Test file to verify permissions',
      ContentType: 'text/plain'
    }).promise();
    
    console.log('✅ Put object successful!');
    
    // Clean up test file
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: testKey
    }).promise();
    
    console.log('✅ Delete object successful!');
    console.log('🎉 All S3 permissions are working correctly!');
    
  } catch (error) {
    console.error('❌ S3 connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'AccessDenied') {
      console.log('\n🔧 SOLUTION: You need to add the following permissions to your IAM user "Zia-use":');
      console.log('1. Go to AWS Console → IAM → Users → Zia-use');
      console.log('2. Add these permissions:');
      console.log('   - s3:ListBucket');
      console.log('   - s3:PutObject');
      console.log('   - s3:DeleteObject');
      console.log('   - s3:GetObject');
      console.log('3. Use the policy from s3-iam-policy.json file');
    }
  }
}

testS3Connection();
