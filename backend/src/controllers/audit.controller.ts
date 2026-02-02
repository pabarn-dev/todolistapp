import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as auditService from '../services/audit.service.js';
import type { AuthenticatedRequest } from '../types/index.js';

export async function getAuditLogs(req: AuthenticatedRequest, res: Response) {
  const { entityType, entityId, userId, action, limit, cursor } = req.query;

  const result = await auditService.getAuditLogs(
    req.organizationMember!.organizationId,
    {
      entityType: entityType as string | undefined,
      entityId: entityId as string | undefined,
      userId: userId as string | undefined,
      action: action as any,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      cursor: cursor as string | undefined,
    }
  );

  res.status(StatusCodes.OK).json({
    success: true,
    data: result.items,
    pagination: {
      nextCursor: result.nextCursor,
    },
  });
}
