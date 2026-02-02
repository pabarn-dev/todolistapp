import type { Response, NextFunction } from 'express';
import type { OrganizationRole, ProjectRole } from '@prisma/client';
import type { AuthenticatedRequest, OrganizationPermission, ProjectPermission } from '../types/index.js';
import { ORGANIZATION_PERMISSIONS, PROJECT_PERMISSIONS } from '../types/index.js';
import { prisma } from '../config/database.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';

export function requireOrgMembership(paramName = 'orgSlug') {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    const identifier = req.params[paramName] as string;
    const userId = req.user.id;

    const organization = await prisma.organization.findFirst({
      where: {
        OR: [{ slug: identifier }, { id: identifier }],
        deletedAt: null,
      },
    });

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    const membership = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId: organization.id } },
    });

    if (!membership) {
      throw new ForbiddenError('You are not a member of this organization');
    }

    req.organizationMember = membership;
    (req as AuthenticatedRequest & { organization: typeof organization }).organization = organization;
    next();
  };
}

export function requireOrgPermission(permission: OrganizationPermission) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const membership = req.organizationMember;

    if (!membership) {
      throw new ForbiddenError('Organization membership required');
    }

    const role = membership.role as OrganizationRole;
    const permissions = ORGANIZATION_PERMISSIONS[role] as readonly string[];

    if (!permissions.includes(permission)) {
      throw new ForbiddenError(`Missing permission: ${permission}`);
    }

    next();
  };
}

export function requireProjectMembership(paramName = 'projectSlug') {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    const identifier = req.params[paramName] as string;
    const userId = req.user.id;
    const orgMember = req.organizationMember;

    if (!orgMember) {
      throw new ForbiddenError('Organization membership required');
    }

    const project = await prisma.project.findFirst({
      where: {
        OR: [{ slug: identifier }, { id: identifier }],
        organizationId: orgMember.organizationId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // OWNER and ADMIN have implicit access to all projects
    if (['OWNER', 'ADMIN'].includes(orgMember.role)) {
      (req as AuthenticatedRequest & { project: typeof project }).project = project;
      req.projectMember = {
        id: 'implicit',
        userId,
        projectId: project.id,
        role: 'MANAGER' as ProjectRole,
        joinedAt: new Date(),
        updatedAt: new Date(),
      };
      next();
      return;
    }

    const projectMembership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: project.id } },
    });

    if (!projectMembership) {
      throw new ForbiddenError('You are not a member of this project');
    }

    req.projectMember = projectMembership;
    (req as AuthenticatedRequest & { project: typeof project }).project = project;
    next();
  };
}

export function requireProjectPermission(permission: ProjectPermission) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const membership = req.projectMember;

    if (!membership) {
      throw new ForbiddenError('Project membership required');
    }

    const role = membership.role as ProjectRole;
    const permissions = PROJECT_PERMISSIONS[role] as readonly string[];

    if (!permissions.includes(permission)) {
      throw new ForbiddenError(`Missing permission: ${permission}`);
    }

    next();
  };
}
