
import 'dotenv/config';                
import { execSync } from 'node:child_process';

try {
  console.log('Running `prisma generate` …');
  execSync('npx prisma generate', { stdio: 'inherit' }); 
} catch (err) {
  console.error('Could not run `prisma generate`:', err);
  process.exit(1);
}

import { prisma } from './src/utils/database.js';
import { withAccelerate } from '@prisma/extension-accelerate';
import express, { type Application } from 'express';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import userRoutes from './src/routes/user.route.js';
import providerRoutes from './src/routes/provider.route.js';
import companyRoutes from './src/routes/company.route.js';
import servicesRoutes from './src/routes/services.route.js';
import categoryRoutes from './src/routes/category.route.js';
import adminRoutes from './src/routes/admin.route.js';
import healthRoutes from './src/routes/health.route.js';
import { performanceMonitor } from './src/middlewares/performance.middleware.js';

// Extend prisma with Accelerate
const acceleratedPrisma = prisma.$extends(withAccelerate()); 

// Database connectivity test function
async function testDatabaseConnection() {
  console.log('\n🔍 Quick database connectivity test...');
  try {
    const startTime = Date.now();
    
    // Just test basic connection
    await acceleratedPrisma.$queryRaw`SELECT 1 as test`;
    const connectionTime = Date.now() - startTime;
    console.log(`✅ Database connection successful (${connectionTime}ms)`);
    
    console.log('🎉 Database test passed!\n');
    return true;
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', {
      code: error.code,
      name: error.name
    });
    
    if (error.code === 'P1001') {
      console.log('\n🔍 Network troubleshooting suggestions:');
      console.log('1. Check if your internet connection is stable');
      console.log('2. Verify AWS RDS instance is running and accessible');
      console.log('3. Check security group settings (port 5432 should be open)');
      console.log('4. Verify the database URL in .env file');
    }
    
    return false;
  }
} 

const app: Application = express();

// Enable compression for all responses
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Add performance monitoring
app.use(performanceMonitor);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow both frontend and backend origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow cookies if needed
}));

// Increase JSON payload limit for file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', healthRoutes);

const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Start server with database test
async function startServer() {
  console.log('🚀 Starting server...');
  
  // Run database test before starting the server
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.error('💥 Server startup aborted due to database connection failure');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log(`🎯 Server running on port ${PORT}`);
    console.log(`📊 Health check available at: http://localhost:${PORT}/api/health`);
    console.log(`🔍 Database health check: http://localhost:${PORT}/api/health/database`);
  });
}

// Start the server
startServer().catch((error) => {
  console.error('💥 Failed to start server:', error);
  process.exit(1);
});
