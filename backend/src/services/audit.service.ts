import { AuditAction, Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';

interface AuditLogParams {
  organizationId: string;
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
}

export async function createAuditLog(params: AuditLogParams) {
  return prisma.auditLog.create({
    data: {
      organizationId: params.organizationId,
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata,
      ipAddress: params.ipAddress,
    },
  });
}

export async function getAuditLogs(
  organizationId: string,
  options?: {
    entityType?: string;
    entityId?: string;
    userId?: string;
    action?: AuditAction;
    limit?: number;
    cursor?: string;
  }
) {
  const limit = options?.limit ?? 50;

  const logs = await prisma.auditLog.findMany({
    where: {
      organizationId,
      ...(options?.entityType && { entityType: options.entityType }),
      ...(options?.entityId && { entityId: options.entityId }),
      ...(options?.userId && { userId: options.userId }),
      ...(options?.action && { action: options.action }),
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(options?.cursor && { cursor: { id: options.cursor }, skip: 1 }),
  });

  const hasMore = logs.length > limit;
  const items = hasMore ? logs.slice(0, -1) : logs;

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1]?.id : null,
  };
}

// Helper to log common actions
export const AuditHelpers = {
  taskCreated: (orgId: string, userId: string, taskId: string, title: string) =>
    createAuditLog({
      organizationId: orgId,
      userId,
      action: AuditAction.CREATE,
      entityType: 'Task',
      entityId: taskId,
      metadata: { title } as Prisma.InputJsonValue,
    }),

  taskStatusChanged: (orgId: string, userId: string, taskId: string, from: string, to: string) =>
    createAuditLog({
      organizationId: orgId,
      userId,
      action: AuditAction.STATUS_CHANGE,
      entityType: 'Task',
      entityId: taskId,
      metadata: { from, to } as Prisma.InputJsonValue,
    }),

  taskAssigned: (orgId: string, userId: string, taskId: string, assigneeId: string | null) =>
    createAuditLog({
      organizationId: orgId,
      userId,
      action: assigneeId ? AuditAction.ASSIGN : AuditAction.UNASSIGN,
      entityType: 'Task',
      entityId: taskId,
      metadata: { assigneeId } as Prisma.InputJsonValue,
    }),

  memberJoined: (orgId: string, userId: string, role: string) =>
    createAuditLog({
      organizationId: orgId,
      userId,
      action: AuditAction.JOIN,
      entityType: 'OrganizationMember',
      entityId: userId,
      metadata: { role } as Prisma.InputJsonValue,
    }),

  memberLeft: (orgId: string, userId: string) =>
    createAuditLog({
      organizationId: orgId,
      userId,
      action: AuditAction.LEAVE,
      entityType: 'OrganizationMember',
      entityId: userId,
    }),

  projectCreated: (orgId: string, userId: string, projectId: string, name: string) =>
    createAuditLog({
      organizationId: orgId,
      userId,
      action: AuditAction.CREATE,
      entityType: 'Project',
      entityId: projectId,
      metadata: { name } as Prisma.InputJsonValue,
    }),
};
