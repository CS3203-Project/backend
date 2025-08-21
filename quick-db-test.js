import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  // Parse the connection string and handle SSL properly
  const connectionString = process.env.DATABASE_URL;
  
  const client = new Client({
    connectionString: connectionString.replace('?sslmode=require', ''),
    ssl: {
      rejectUnauthorized: false, // Allow self-signed certificates
      require: true,
    },
  });

  try {
    console.log('🔄 Attempting to connect to database...');
    console.log('🔗 Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
    await client.connect();
    console.log('✅ Connection successful!');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('📅 Current database time:', result.rows[0].current_time);
    
    await client.end();
    console.log('✅ Connection closed properly');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('💡 Check the manual steps above to fix the connection');
  }
}

testConnection();
