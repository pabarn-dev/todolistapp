import { Router } from 'express';
import type { RequestHandler } from 'express';
import * as projectController from '../controllers/project.controller.js';
import * as taskController from '../controllers/task.controller.js';
import * as commentController from '../controllers/comment.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireOrgMembership, requireProjectMembership, requireProjectPermission } from '../middleware/rbac.middleware.js';
import { createProjectSchema, updateProjectSchema, addProjectMemberSchema, updateProjectMemberSchema } from '../validators/project.validator.js';
import { createTaskSchema, updateTaskSchema, taskQuerySchema, reorderTasksSchema } from '../validators/task.validator.js';
import { createCommentSchema, updateCommentSchema } from '../validators/comment.validator.js';

const router = Router();

// All routes require authentication and org membership
router.use(authenticate as RequestHandler);

// Project CRUD (scoped to organization)
router.post('/:orgSlug/projects', requireOrgMembership() as RequestHandler, validate(createProjectSchema), projectController.create as RequestHandler);
router.get('/:orgSlug/projects', requireOrgMembership() as RequestHandler, projectController.getAll as RequestHandler);
router.get('/:orgSlug/projects/:projectSlug', requireOrgMembership() as RequestHandler, requireProjectMembership() as RequestHandler, projectController.getBySlug as RequestHandler);
router.patch('/:orgSlug/projects/:projectSlug', requireOrgMembership() as RequestHandler, requireProjectMembership() as RequestHandler, requireProjectPermission('project:update') as RequestHandler, validate(updateProjectSchema), projectController.update as RequestHandler);
router.delete('/:orgSlug/projects/:projectSlug', requireOrgMembership() as RequestHandler, requireProjectMembership() as RequestHandler, requireProjectPermission('project:delete') as RequestHandler, projectController.remove as RequestHandler);

// Project members
router.post('/:orgSlug/projects/:projectSlug/members', requireOrgMembership() as RequestHandler, requireProjectMembership() as RequestHandler, requireProjectPermission('project:member_manage') as RequestHandler, validate(addProjectMemberSchema), projectController.addMember as RequestHandler);
router.patch('/:orgSlug/projects/:projectSlug/members/:userId', requireOrgMembership() as RequestHandler, requireProjectMembership() as RequestHandler, requireProjectPermission('project:member_manage') as RequestHandler, validate(updateProjectMemberSchema), projectController.updateMember as RequestHandler);
router.delete('/:orgSlug/projects/:projectSlug/members/:userId', requireOrgMembership() as RequestHandler, requireProjectMembership() as RequestHandler, requireProjectPermission('project:member_manage') as RequestHandler, projectController.removeMember as RequestHandler);

// Tasks
router.get('/:orgSlug/projects/:projectSlug/tasks', requireOrgMembership() as RequestHandler, requireProjectMembership() as RequestHandler, validate(taskQuerySchema, 'query'), taskController.getAll as RequestHandler);
router.post('/:orgSlug/projects/:projectSlug/tasks', requireOrgMembership() as RequestHandler, requireProjectMembership() as RequestHandler, requireProjectPermission('task:create') as RequestHandler, validate(createTaskSchema), taskController.create as RequestHandler);
router.get('/:orgSlug/projects/:projectSlug/tasks/stats', requireOrgMembership() as RequestHandler, requireProjectMembership() as RequestHandler, taskController.getStats as RequestHandler);
router.patch('/:orgSlug/projects/:projectSlug/tasks/reorder', requireOrgMembership() as RequestHandler, requireProjectMembership() as RequestHandler, validate(reorderTasksSchema), taskController.reorder as RequestHandler);
router.get('/:orgSlug/projects/:projectSlug/tasks/:taskId', requireOrgMembership() as RequestHandler, requireProjectMembership() as RequestHandler, taskController.getById as RequestHandler);
router.patch('/:orgSlug/projects/:projectSlug/tasks/:taskId', requireOrgMembership() as RequestHandler, requireProjectMembership() as RequestHandler, validate(updateTaskSchema), taskController.update as RequestHandler);
router.delete('/:orgSlug/projects/:projectSlug/tasks/:taskId', requireOrgMembership() as RequestHandler, requireProjectMembership() as RequestHandler, taskController.remove as RequestHandler);

// Comments
router.get('/:orgSlug/projects/:projectSlug/tasks/:taskId/comments', requireOrgMembership() as RequestHandler, requireProjectMembership() as RequestHandler, commentController.getAll as RequestHandler);
router.post('/:orgSlug/projects/:projectSlug/tasks/:taskId/comments', requireOrgMembership() as RequestHandler, requireProjectMembership() as RequestHandler, requireProjectPermission('comment:create') as RequestHandler, validate(createCommentSchema), commentController.create as RequestHandler);
router.patch('/:orgSlug/projects/:projectSlug/comments/:commentId', requireOrgMembership() as RequestHandler, requireProjectMembership() as RequestHandler, validate(updateCommentSchema), commentController.update as RequestHandler);
router.delete('/:orgSlug/projects/:projectSlug/comments/:commentId', requireOrgMembership() as RequestHandler, requireProjectMembership() as RequestHandler, commentController.remove as RequestHandler);

export default router;
