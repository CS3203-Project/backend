import { Router } from 'express';
const router = Router();
import { createUser } from '../src/controllers/user.controller.js';
import validate from '../src/middlewares/validation.middleware.js';
import { registerSchema } from '../src/validators/user.validator.js';

router.post('/register', validate(registerSchema), createUser);


export default router;
