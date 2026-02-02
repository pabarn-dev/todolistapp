import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as invitationService from '../services/invitation.service.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { CreateInvitationInput } from '../validators/invitation.validator.js';

export async function create(req: AuthenticatedRequest, res: Response) {
  const data = req.body as CreateInvitationInput;
  const invitation = await invitationService.createInvitation(
    req.organizationMember!.organizationId,
    req.user.id,
    data
  );

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: invitation,
  });
}

export async function getAll(req: AuthenticatedRequest, res: Response) {
  const invitations = await invitationService.getInvitations(req.organizationMember!.organizationId);

  res.status(StatusCodes.OK).json({
    success: true,
    data: invitations,
  });
}

export async function getByToken(req: Request, res: Response) {
  const token = req.params.token as string;
  const invitation = await invitationService.getInvitationByToken(token);

  res.status(StatusCodes.OK).json({
    success: true,
    data: invitation,
  });
}

export async function accept(req: AuthenticatedRequest, res: Response) {
  const token = req.params.token as string;
  const member = await invitationService.acceptInvitation(token, req.user.id, req.user.email);

  res.status(StatusCodes.OK).json({
    success: true,
    data: member,
  });
}

export async function revoke(req: AuthenticatedRequest, res: Response) {
  const invitationId = req.params.invitationId as string;
  await invitationService.revokeInvitation(invitationId, req.organizationMember!.organizationId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Invitation revoked',
  });
}
