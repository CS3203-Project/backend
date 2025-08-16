import { Router } from 'express';
const router = Router();
import { createUser,loginUser,getUserProfile,updateUserProfile,deleteUserProfile,checkEmailExistsController,searchUsersController} from './user.controller.js';
import validate from '../shared/middlewares/validation.middleware.js';
import { registerSchema,loginSchema,updateProfileSchema } from './user.validator.js';
import authMiddleware from '../shared/middlewares/auth.middleware.js';

router.get('/check-email', checkEmailExistsController);
router.get('/search', authMiddleware, searchUsersController);
router.post('/register', validate(registerSchema), createUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, validate(updateProfileSchema), updateUserProfile);
router.delete('/profile', authMiddleware, deleteUserProfile);

export default router;
