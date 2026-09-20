const { S3Client, ListBucketsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

async function testConnection() {
  console.log('Testing R2 connection...');
  console.log('Endpoint:', `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
  console.log('Bucket:', process.env.R2_BUCKET_NAME);
  
  try {
    // Test 1: List buckets (this tests if credentials work)
    const listCommand = new ListBucketsCommand({});
    const response = await r2.send(listCommand);
    console.log('✅ Connection successful!');
    console.log('Your buckets:', response.Buckets.map(b => b.Name).join(', '));
    
    // Test 2: Try to upload a tiny test file
    const testKey = 'test/test-file.txt';
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: testKey,
      Body: 'Hello R2!',
      ContentType: 'text/plain',
    });
    
    await r2.send(uploadCommand);
    console.log('✅ Upload successful!');
    console.log(`File uploaded to: ${process.env.R2_PUBLIC_URL}/${testKey}`);
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    if (error.$metadata) {
      console.error('HTTP Status:', error.$metadata.httpStatusCode);
    }
    console.error('Full error:', error);
  }
}

testConnection();

