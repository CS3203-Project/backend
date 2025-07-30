import { Router } from 'express';
const router = Router();
import { createUser,loginUser,getUserProfile,updateUserProfile,deleteUserProfile} from '../controllers/user.controller.js';
import validate from '../middlewares/validation.middleware.js';
import { registerSchema,loginSchema,updateProfileSchema } from '../validators/user.validator.js';
import authMiddleware from '../middlewares/auth.middleware.js';

router.post('/register', validate(registerSchema), createUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, validate(updateProfileSchema), updateUserProfile);
router.delete('/profile', authMiddleware, deleteUserProfile);

export default router;
