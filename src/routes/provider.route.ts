import { Router } from 'express';
const router = Router();
import { 
  createProvider, 
  updateProvider, 
  deleteProvider, 
  getProviderProfile 
} from '../controllers/provider.controller.js';
import validate from '../middlewares/validation.middleware.js';
import { createProviderSchema, updateProviderSchema } from '../validators/provider.validator.js';
import authMiddleware from '../middlewares/auth.middleware.js';

router.post('/', authMiddleware, validate(createProviderSchema), createProvider);
router.get('/profile', authMiddleware, getProviderProfile);
router.put('/profile', authMiddleware, validate(updateProviderSchema), updateProvider);
router.delete('/profile', authMiddleware, deleteProvider);

export default router;
