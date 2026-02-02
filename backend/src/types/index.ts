import type { Request } from 'express';
import type { User, OrganizationMember, ProjectMember } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
  organizationMember?: OrganizationMember;
  projectMember?: ProjectMember;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type UserWithoutPassword = Omit<User, 'passwordHash'>;

export const ORGANIZATION_PERMISSIONS = {
  OWNER: [
    'org:delete',
    'org:update',
    'org:transfer',
    'member:manage',
    'member:remove_admin',
    'project:create',
    'project:delete_any',
    'invite:send',
    'invite:revoke',
    'label:manage',
  ],
  ADMIN: [
    'org:update',
    'member:manage',
    'member:invite',
    'project:create',
    'project:delete_any',
    'invite:send',
    'invite:revoke',
    'label:manage',
  ],
  MEMBER: [
    'project:create',
    'project:view',
    'label:view',
  ],
  GUEST: [
    'project:view',
  ],
} as const;

export const PROJECT_PERMISSIONS = {
  MANAGER: [
    'project:update',
    'project:delete',
    'project:member_manage',
    'task:create',
    'task:update_any',
    'task:delete_any',
    'task:assign',
  ],
  MEMBER: [
    'task:create',
    'task:update_own',
    'task:update_assigned',
    'task:delete_own',
    'comment:create',
    'comment:update_own',
    'comment:delete_own',
  ],
  VIEWER: [
    'task:view',
    'comment:view',
  ],
} as const;

export type OrganizationPermission = typeof ORGANIZATION_PERMISSIONS[keyof typeof ORGANIZATION_PERMISSIONS][number];
export type ProjectPermission = typeof PROJECT_PERMISSIONS[keyof typeof PROJECT_PERMISSIONS][number];
