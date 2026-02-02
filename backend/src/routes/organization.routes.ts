import { Router } from 'express';
import type { RequestHandler } from 'express';
import * as orgController from '../controllers/organization.controller.js';
import * as invitationController from '../controllers/invitation.controller.js';
import * as labelController from '../controllers/label.controller.js';
import * as auditController from '../controllers/audit.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireOrgMembership, requireOrgPermission } from '../middleware/rbac.middleware.js';
import { createOrganizationSchema, updateOrganizationSchema, updateMemberRoleSchema } from '../validators/organization.validator.js';
import { createInvitationSchema } from '../validators/invitation.validator.js';
import { createLabelSchema, updateLabelSchema } from '../validators/label.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate as RequestHandler);

// Organization CRUD
router.post('/', validate(createOrganizationSchema), orgController.create as RequestHandler);
router.get('/', orgController.getAll as RequestHandler);

// Routes requiring org membership
router.get('/:orgSlug', requireOrgMembership() as RequestHandler, orgController.getBySlug as RequestHandler);
router.patch('/:orgSlug', requireOrgMembership() as RequestHandler, requireOrgPermission('org:update') as RequestHandler, validate(updateOrganizationSchema), orgController.update as RequestHandler);
router.delete('/:orgSlug', requireOrgMembership() as RequestHandler, requireOrgPermission('org:delete') as RequestHandler, orgController.remove as RequestHandler);

// Members
router.get('/:orgSlug/members', requireOrgMembership() as RequestHandler, orgController.getMembers as RequestHandler);
router.patch('/:orgSlug/members/:userId', requireOrgMembership() as RequestHandler, requireOrgPermission('member:manage') as RequestHandler, validate(updateMemberRoleSchema), orgController.updateMemberRole as RequestHandler);
router.delete('/:orgSlug/members/:userId', requireOrgMembership() as RequestHandler, orgController.removeMember as RequestHandler);

// Invitations
router.get('/:orgSlug/invitations', requireOrgMembership() as RequestHandler, requireOrgPermission('invite:send') as RequestHandler, invitationController.getAll as RequestHandler);
router.post('/:orgSlug/invitations', requireOrgMembership() as RequestHandler, requireOrgPermission('invite:send') as RequestHandler, validate(createInvitationSchema), invitationController.create as RequestHandler);
router.delete('/:orgSlug/invitations/:invitationId', requireOrgMembership() as RequestHandler, requireOrgPermission('invite:revoke') as RequestHandler, invitationController.revoke as RequestHandler);

// Audit Logs
router.get('/:orgSlug/audit-logs', requireOrgMembership() as RequestHandler, requireOrgPermission('org:update') as RequestHandler, auditController.getAuditLogs as RequestHandler);

// Labels
router.get('/:orgSlug/labels', requireOrgMembership() as RequestHandler, labelController.getAll as RequestHandler);
router.post('/:orgSlug/labels', requireOrgMembership() as RequestHandler, requireOrgPermission('label:manage') as RequestHandler, validate(createLabelSchema), labelController.create as RequestHandler);
router.patch('/:orgSlug/labels/:labelId', requireOrgMembership() as RequestHandler, requireOrgPermission('label:manage') as RequestHandler, validate(updateLabelSchema), labelController.update as RequestHandler);
router.delete('/:orgSlug/labels/:labelId', requireOrgMembership() as RequestHandler, requireOrgPermission('label:manage') as RequestHandler, labelController.remove as RequestHandler);

export default router;
