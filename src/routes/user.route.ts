import { Router } from 'express';
const router = Router();
import { createUser,loginUser,getUserProfile,updateUserProfile,deleteUserProfile,checkEmailExistsController,searchUsersController} from '../controllers/user.controller.js';
import validate from '../middlewares/validation.middleware.js';
import { registerSchema,loginSchema,updateProfileSchema } from '../validators/user.validator.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { upload } from '../utils/s3.js';

router.get('/check-email', checkEmailExistsController);
router.get('/search', authMiddleware, searchUsersController);
router.post('/register', validate(registerSchema), createUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, upload.single('profileImage'), updateUserProfile);
router.delete('/profile', authMiddleware, deleteUserProfile);

export default router;
