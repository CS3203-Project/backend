
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
import express from 'express';
import cors from 'cors';
import userRoutes from './src/routes/user.route.js';
import providerRoutes from './src/routes/provider.route.js';
import companyRoutes from './src/routes/company.route.js';
import servicesRoutes from './src/routes/services.route.js';
import categoryRoutes from './src/routes/catagory.route.js';

const prisma = new PrismaClient().$extends(withAccelerate()); 

const app = express();

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
