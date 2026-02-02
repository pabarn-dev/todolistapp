import { Router } from 'express';
import type { RequestHandler } from 'express';
import * as invitationController from '../controllers/invitation.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public: Get invitation details by token (for preview before login)
router.get('/:token', invitationController.getByToken as RequestHandler);

// Private: Accept invitation (requires auth)
router.post('/:token/accept', authenticate as RequestHandler, invitationController.accept as RequestHandler);

export default router;
