import { Router } from 'express';
const router = Router();
import { 
  createProvider, 
  updateProvider, 
  deleteProvider, 
  getProviderProfile, 
  getProviderById
} from './provider.controller.js';
import validate from '../shared/middlewares/validation.middleware.js';
import { createProviderSchema, updateProviderSchema, providerParamsSchema } from './provider.validator.js';
import authMiddleware from '../shared/middlewares/auth.middleware.js';

router.post('/', authMiddleware, validate(createProviderSchema), createProvider);
router.get('/profile', authMiddleware, getProviderProfile);
router.put('/profile', authMiddleware, validate(updateProviderSchema), updateProvider);
router.delete('/profile', authMiddleware, deleteProvider);
router.get('/:id', validate(providerParamsSchema, 'params'), getProviderById);

export default router;
