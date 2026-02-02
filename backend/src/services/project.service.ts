import { ProjectRole } from '@prisma/client';
import { prisma } from '../config/database.js';
import { generateUniqueSlug, generateSlug } from '../utils/helpers.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import type { CreateProjectInput, UpdateProjectInput } from '../validators/project.validator.js';

export async function createProject(orgId: string, userId: string, data: CreateProjectInput) {
  const slug = data.slug || generateSlug(data.name);

  // Check if slug exists in this org
  const existingProject = await prisma.project.findUnique({
    where: { organizationId_slug: { organizationId: orgId, slug } },
  });

  const finalSlug = existingProject ? generateUniqueSlug(data.name) : slug;

  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      slug: finalSlug,
      color: data.color,
      organizationId: orgId,
      members: {
        create: {
          userId,
          role: ProjectRole.MANAGER,
        },
      },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      },
      _count: { select: { tasks: true, members: true } },
    },
  });

  return project;
}

export async function getProjects(orgId: string, userId: string, isOrgAdmin: boolean) {
  const where = isOrgAdmin
    ? { organizationId: orgId, deletedAt: null }
    : { organizationId: orgId, deletedAt: null, members: { some: { userId } } };

  const projects = await prisma.project.findMany({
    where,
    include: {
      members: {
        where: { userId },
        select: { role: true },
      },
      _count: { select: { tasks: true, members: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return projects.map((project) => ({
    ...project,
    myRole: project.members[0]?.role,
    members: undefined,
  }));
}

export async function getProjectBySlug(orgId: string, slug: string) {
  const project = await prisma.project.findFirst({
    where: {
      organizationId: orgId,
      slug,
      deletedAt: null,
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        orderBy: { joinedAt: 'asc' },
      },
      _count: { select: { tasks: true, members: true } },
    },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  return project;
}

export async function updateProject(projectId: string, data: UpdateProjectInput) {
  const project = await prisma.project.update({
    where: { id: projectId },
    data,
    include: {
      _count: { select: { tasks: true, members: true } },
    },
  });

  return project;
}

export async function deleteProject(projectId: string) {
  await prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: new Date() },
  });
}

export async function addProjectMember(projectId: string, userId: string, role: ProjectRole) {
  // Check if user is member of the organization
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      organization: {
        include: {
          members: { where: { userId } },
        },
      },
    },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (project.organization.members.length === 0) {
    throw new ConflictError('User is not a member of the organization');
  }

  // Check if already a member
  const existingMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (existingMember) {
    throw new ConflictError('User is already a member of this project');
  }

  const member = await prisma.projectMember.create({
    data: { projectId, userId, role },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return member;
}

export async function updateProjectMemberRole(projectId: string, userId: string, role: ProjectRole) {
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (!member) {
    throw new NotFoundError('Member not found');
  }

  const updated = await prisma.projectMember.update({
    where: { id: member.id },
    data: { role },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return updated;
}

export async function removeProjectMember(projectId: string, userId: string) {
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (!member) {
    throw new NotFoundError('Member not found');
  }

  await prisma.projectMember.delete({
    where: { id: member.id },
  });
}
