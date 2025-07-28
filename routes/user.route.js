import { Router } from 'express';
const router = Router();
import { createUser } from '../controllers/user.controller.js';
import validate from '../middlewares/validation.middleware.js';
import { registerSchema } from '../validators/user.validator.js';

router.post('/register', validate(registerSchema), createUser);


export default router;
