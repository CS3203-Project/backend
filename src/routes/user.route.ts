import { Router } from 'express';
const router = Router();
import { createUser,loginUser,getUserProfile,updateUserProfile,deleteUserProfile,checkEmailExistsController,searchUsersController,uploadImageController,getUserByIdController } from '../controllers/user.controller.js';
import validate from '../middlewares/validation.middleware.js';
import { registerSchema,loginSchema,updateProfileSchema } from '../validators/user.validator.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { upload } from '../utils/s3.js';

router.get('/check-email', checkEmailExistsController);
router.get('/search', authMiddleware, searchUsersController);
router.get('/profile', authMiddleware, getUserProfile);
router.get('/:userId', getUserByIdController);
router.post('/register', validate(registerSchema), createUser);
router.post('/login', validate(loginSchema), loginUser);
router.put('/profile', authMiddleware, upload.single('profileImage'), updateUserProfile);
router.delete('/profile', authMiddleware, deleteUserProfile);
router.post('/upload-image', authMiddleware, upload.single('image'), uploadImageController);

export default router;
