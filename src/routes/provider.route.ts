import { Router } from 'express';
const router = Router();
import { 
  createProvider, 
  updateProvider, 
  deleteProvider, 
  getProviderProfile, 
  getProviderById,
  verifyProvider,
  unverifyProvider,
  uploadIdCard
} from '../controllers/provider.controller.js';
import validate from '../middlewares/validation.middleware.js';
import { createProviderSchema, updateProviderSchema, providerParamsSchema } from '../validators/provider.validator.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import adminMiddleware from '../middlewares/admin.middleware.js';
import { upload, handleUploadError } from '../utils/s3.js';

router.post('/', authMiddleware, validate(createProviderSchema), createProvider);
router.get('/profile', authMiddleware, getProviderProfile);
router.put('/profile', authMiddleware, validate(updateProviderSchema), updateProvider);
router.delete('/profile', authMiddleware, deleteProvider);
router.get('/:id', validate(providerParamsSchema, 'params'), getProviderById);

// ID Card upload route
router.post('/upload-idcard', authMiddleware, handleUploadError(upload.single('idCard')), uploadIdCard);

// Verification routes (admin only)
router.put('/:id/verify', authMiddleware, adminMiddleware, validate(providerParamsSchema, 'params'), verifyProvider);
router.put('/:id/unverify', authMiddleware, adminMiddleware, validate(providerParamsSchema, 'params'), unverifyProvider);

export default router;
