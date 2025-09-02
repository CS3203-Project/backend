import { Router } from 'express';
const router = Router();
import { createUser,loginUser,getUserProfile,updateUserProfile,deleteUserProfile,checkEmailExistsController,searchUsersController,uploadImageController,createAdminUser} from '../controllers/user.controller.js';
import validate from '../middlewares/validation.middleware.js';
import { registerSchema,loginSchema,updateProfileSchema } from '../validators/user.validator.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import adminMiddleware from '../middlewares/admin.middleware.js';
import { upload, handleUploadError } from '../utils/s3.js';

router.get('/check-email', checkEmailExistsController);
router.get('/search', authMiddleware, searchUsersController);
router.post('/register', validate(registerSchema), createUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, handleUploadError(upload.single('profileImage')), updateUserProfile);
router.delete('/profile', authMiddleware, deleteUserProfile);
router.post('/upload-image', authMiddleware, handleUploadError(upload.single('image')), uploadImageController);

// Admin creation route (admin only)
router.post('/admin', authMiddleware, adminMiddleware, validate(registerSchema), createAdminUser);

export default router;
