import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  // Connect to the default postgres database first
  const client = new Client({
    connectionString: process.env.DATABASE_URL.replace('?sslmode=require&sslcert=&sslkey=&sslrootcert=', ''),
    ssl: {
      rejectUnauthorized: false,
      require: true,
    },
  });

  try {
    console.log('🔄 Connecting to PostgreSQL server...');
    await client.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Check if the zia database exists
    const checkDb = await client.query("SELECT 1 FROM pg_database WHERE datname = 'zia'");
    
    if (checkDb.rows.length > 0) {
      console.log('✅ Database "zia" already exists');
    } else {
      console.log('🔄 Creating database "zia"...');
      await client.query('CREATE DATABASE zia');
      console.log('✅ Database "zia" created successfully');
    }

    await client.end();
    console.log('✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
}

createDatabase();
