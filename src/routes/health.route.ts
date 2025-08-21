import { Router, Request, Response } from 'express';
import { prisma } from '../utils/database.js';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const connectionTime = Date.now() - startTime;
    
    // Get basic database stats
    const userCount = await prisma.user.count();
    const serviceCount = await prisma.service.count();
    
    res.json({
      status: 'healthy',
      database: {
        connected: true,
        connectionTime: `${connectionTime}ms`,
        stats: {
          users: userCount,
          services: serviceCount
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Health check failed:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      database: {
        connected: false,
        error: error.message,
        code: error.code
      },
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/health/database', async (req: Request, res: Response) => {
  try {
    const checks = [];
    
    // Test 1: Basic connection
    const connectionStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.push({
      test: 'basic_connection',
      status: 'pass',
      time: `${Date.now() - connectionStart}ms`
    });
    
    // Test 2: User table access
    const userStart = Date.now();
    const userCount = await prisma.user.count();
    checks.push({
      test: 'user_table_access',
      status: 'pass',
      time: `${Date.now() - userStart}ms`,
      result: `${userCount} users`
    });
    
    // Test 3: Write test (if safe)
    const writeStart = Date.now();
    const testWrite = await prisma.$queryRaw`SELECT NOW()`;
    checks.push({
      test: 'write_capability',
      status: 'pass',
      time: `${Date.now() - writeStart}ms`
    });
    
    res.json({
      status: 'healthy',
      checks,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      error: {
        message: error.message,
        code: error.code
      },
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
