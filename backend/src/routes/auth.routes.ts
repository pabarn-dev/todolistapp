import { Router } from 'express';
import type { RequestHandler } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register as RequestHandler);
router.post('/login', validate(loginSchema), authController.login as RequestHandler);
router.post('/refresh', validate(refreshSchema), authController.refresh as RequestHandler);
router.post('/logout', authController.logout as RequestHandler);
router.get('/me', authenticate as RequestHandler, authController.getProfile as RequestHandler);

export default router;
