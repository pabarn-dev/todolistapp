import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as projectService from '../services/project.service.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { CreateProjectInput, UpdateProjectInput, AddProjectMemberInput, UpdateProjectMemberInput } from '../validators/project.validator.js';

export async function create(req: AuthenticatedRequest, res: Response) {
  const data = req.body as CreateProjectInput;
  const project = await projectService.createProject(
    req.organizationMember!.organizationId,
    req.user.id,
    data
  );

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: project,
  });
}

export async function getAll(req: AuthenticatedRequest, res: Response) {
  const isOrgAdmin = ['OWNER', 'ADMIN'].includes(req.organizationMember!.role);
  const projects = await projectService.getProjects(
    req.organizationMember!.organizationId,
    req.user.id,
    isOrgAdmin
  );

  res.status(StatusCodes.OK).json({
    success: true,
    data: projects,
  });
}

export async function getBySlug(req: AuthenticatedRequest, res: Response) {
  const projectSlug = req.params.projectSlug as string;
  const project = await projectService.getProjectBySlug(
    req.organizationMember!.organizationId,
    projectSlug
  );

  res.status(StatusCodes.OK).json({
    success: true,
    data: project,
  });
}

export async function update(req: AuthenticatedRequest, res: Response) {
  const data = req.body as UpdateProjectInput;
  const project = await projectService.updateProject(req.projectMember!.projectId, data);

  res.status(StatusCodes.OK).json({
    success: true,
    data: project,
  });
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  await projectService.deleteProject(req.projectMember!.projectId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Project deleted',
  });
}

export async function addMember(req: AuthenticatedRequest, res: Response) {
  const data = req.body as AddProjectMemberInput;
  const member = await projectService.addProjectMember(
    req.projectMember!.projectId,
    data.userId,
    data.role
  );

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: member,
  });
}

export async function updateMember(req: AuthenticatedRequest, res: Response) {
  const userId = req.params.userId as string;
  const data = req.body as UpdateProjectMemberInput;

  const member = await projectService.updateProjectMemberRole(
    req.projectMember!.projectId,
    userId,
    data.role
  );

  res.status(StatusCodes.OK).json({
    success: true,
    data: member,
  });
}

export async function removeMember(req: AuthenticatedRequest, res: Response) {
  const userId = req.params.userId as string;

  await projectService.removeProjectMember(req.projectMember!.projectId, userId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Member removed from project',
  });
}
