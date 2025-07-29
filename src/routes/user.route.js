import { Router } from 'express';
const router = Router();
import { createUser,loginUser } from '../controllers/user.controller.js';
import validate from '../middlewares/validation.middleware.js';
import { registerSchema,loginSchema } from '../validators/user.validator.js';
// import authMiddleware from '../middlewares/auth.middleware.js';

router.post('/register', validate(registerSchema), createUser);
router.post('/login', validate(loginSchema), loginUser);

export default router;
