import { Router } from 'express';
import { createAdminUser } from '../controllers/user.controller.js';
import validate from '../middlewares/validation.middleware.js';
import { registerSchema } from '../validators/user.validator.js';
import { prisma } from '../utils/database.js';

const router: import('express').Router = Router();

// Middleware to check if any admin exists
const checkNoAdminExists = async (req: any, res: any, next: any) => {
  try {
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });

    if (adminCount > 0) {
      return res.status(403).json({ 
        error: 'Admin already exists. Use the regular admin creation endpoint with admin authentication.' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Initial admin creation route (only works when no admin exists)
router.post('/initial-admin', checkNoAdminExists, validate(registerSchema), createAdminUser);

export default router;
