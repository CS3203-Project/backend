
import 'dotenv/config';                
import { execSync } from 'node:child_process';

try {
  console.log('Running `prisma generate` …');
  execSync('npx prisma generate', { stdio: 'inherit' }); 
} catch (err) {
  console.error('Could not run `prisma generate`:', err);
  process.exit(1);
}

import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import express, { type Application } from 'express';
import cors from 'cors';
import { userRoutes } from './src/modules/user/index.js';
import { providerRoutes } from './src/modules/provider/index.js';
import { companyRoutes } from './src/modules/company/index.js';
import { servicesRoutes } from './src/modules/service/index.js';
import { categoryRoutes } from './src/modules/category/index.js';
import { errorHandler } from './src/modules/shared/index.js';

const prisma = new PrismaClient().$extends(withAccelerate()); 

const app: Application = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow both frontend and backend origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow cookies if needed
}));

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/categories', categoryRoutes);

// Global error handler (should be last middleware)
app.use(errorHandler);

const PORT: number = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
