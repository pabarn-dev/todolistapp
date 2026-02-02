import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as orgService from '../services/organization.service.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { CreateOrganizationInput, UpdateOrganizationInput, UpdateMemberRoleInput } from '../validators/organization.validator.js';

export async function create(req: AuthenticatedRequest, res: Response) {
  const data = req.body as CreateOrganizationInput;
  const organization = await orgService.createOrganization(req.user.id, data);

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: organization,
  });
}

export async function getAll(req: AuthenticatedRequest, res: Response) {
  const organizations = await orgService.getOrganizations(req.user.id);

  res.status(StatusCodes.OK).json({
    success: true,
    data: organizations,
  });
}

export async function getBySlug(req: AuthenticatedRequest, res: Response) {
  const orgSlug = req.params.orgSlug as string;
  const organization = await orgService.getOrganizationBySlug(orgSlug, req.user.id);

  res.status(StatusCodes.OK).json({
    success: true,
    data: organization,
  });
}

export async function update(req: AuthenticatedRequest, res: Response) {
  const data = req.body as UpdateOrganizationInput;
  const organization = await orgService.updateOrganization(
    req.organizationMember!.organizationId,
    data
  );

  res.status(StatusCodes.OK).json({
    success: true,
    data: organization,
  });
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  await orgService.deleteOrganization(req.organizationMember!.organizationId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Organization deleted',
  });
}

export async function getMembers(req: AuthenticatedRequest, res: Response) {
  const members = await orgService.getMembers(req.organizationMember!.organizationId);

  res.status(StatusCodes.OK).json({
    success: true,
    data: members,
  });
}

export async function updateMemberRole(req: AuthenticatedRequest, res: Response) {
  const userId = req.params.userId as string;
  const data = req.body as UpdateMemberRoleInput;

  const member = await orgService.updateMemberRole(
    req.organizationMember!.organizationId,
    userId,
    data.role,
    req.organizationMember!.role
  );

  res.status(StatusCodes.OK).json({
    success: true,
    data: member,
  });
}

export async function removeMember(req: AuthenticatedRequest, res: Response) {
  const userId = req.params.userId as string;

  await orgService.removeMember(
    req.organizationMember!.organizationId,
    userId,
    req.user.id,
    req.organizationMember!.role
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Member removed',
  });
}
