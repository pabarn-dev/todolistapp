import { OrganizationRole } from '@prisma/client';
import { prisma } from '../config/database.js';
import { generateUniqueSlug, generateSlug } from '../utils/helpers.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors.js';
import type { CreateOrganizationInput, UpdateOrganizationInput } from '../validators/organization.validator.js';

export async function createOrganization(userId: string, data: CreateOrganizationInput) {
  const slug = data.slug || generateSlug(data.name);

  // Check if slug exists
  const existingOrg = await prisma.organization.findUnique({
    where: { slug },
  });

  const finalSlug = existingOrg ? generateUniqueSlug(data.name) : slug;

  const organization = await prisma.organization.create({
    data: {
      name: data.name,
      slug: finalSlug,
      members: {
        create: {
          userId,
          role: OrganizationRole.OWNER,
        },
      },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      },
      _count: { select: { projects: true, members: true } },
    },
  });

  return organization;
}

export async function getOrganizations(userId: string) {
  const organizations = await prisma.organization.findMany({
    where: {
      deletedAt: null,
      members: { some: { userId } },
    },
    include: {
      members: {
        where: { userId },
        select: { role: true },
      },
      _count: { select: { projects: true, members: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return organizations.map((org) => ({
    ...org,
    myRole: org.members[0]?.role,
    members: undefined,
  }));
}

export async function getOrganizationBySlug(slug: string, userId: string) {
  const organization = await prisma.organization.findFirst({
    where: {
      slug,
      deletedAt: null,
      members: { some: { userId } },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        orderBy: { joinedAt: 'asc' },
      },
      _count: { select: { projects: true, members: true, labels: true } },
    },
  });

  if (!organization) {
    throw new NotFoundError('Organization not found');
  }

  const myMembership = organization.members.find((m) => m.userId === userId);

  return {
    ...organization,
    myRole: myMembership?.role,
  };
}

export async function updateOrganization(orgId: string, data: UpdateOrganizationInput) {
  const organization = await prisma.organization.update({
    where: { id: orgId },
    data,
    include: {
      _count: { select: { projects: true, members: true } },
    },
  });

  return organization;
}

export async function deleteOrganization(orgId: string) {
  await prisma.organization.update({
    where: { id: orgId },
    data: { deletedAt: new Date() },
  });
}

export async function getMembers(orgId: string) {
  const members = await prisma.organizationMember.findMany({
    where: { organizationId: orgId },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
    orderBy: { joinedAt: 'asc' },
  });

  return members;
}

export async function updateMemberRole(
  orgId: string,
  targetUserId: string,
  newRole: OrganizationRole,
  currentUserRole: OrganizationRole
) {
  const targetMember = await prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId: targetUserId, organizationId: orgId } },
  });

  if (!targetMember) {
    throw new NotFoundError('Member not found');
  }

  // Only OWNER can modify ADMIN
  if (targetMember.role === OrganizationRole.ADMIN && currentUserRole !== OrganizationRole.OWNER) {
    throw new ForbiddenError('Only owner can modify admin roles');
  }

  // Cannot change OWNER role
  if (targetMember.role === OrganizationRole.OWNER) {
    throw new ForbiddenError('Cannot change owner role');
  }

  // Cannot promote to OWNER
  if (newRole === OrganizationRole.OWNER) {
    throw new ForbiddenError('Cannot promote to owner');
  }

  const updated = await prisma.organizationMember.update({
    where: { id: targetMember.id },
    data: { role: newRole },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return updated;
}

export async function removeMember(
  orgId: string,
  targetUserId: string,
  currentUserId: string,
  currentUserRole: OrganizationRole
) {
  const targetMember = await prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId: targetUserId, organizationId: orgId } },
  });

  if (!targetMember) {
    throw new NotFoundError('Member not found');
  }

  // Cannot remove owner
  if (targetMember.role === OrganizationRole.OWNER) {
    throw new ForbiddenError('Cannot remove organization owner');
  }

  // Only OWNER can remove ADMIN
  if (targetMember.role === OrganizationRole.ADMIN && currentUserRole !== OrganizationRole.OWNER) {
    throw new ForbiddenError('Only owner can remove admins');
  }

  // Users can remove themselves
  if (targetUserId !== currentUserId && currentUserRole === OrganizationRole.MEMBER) {
    throw new ForbiddenError('You cannot remove other members');
  }

  await prisma.organizationMember.delete({
    where: { id: targetMember.id },
  });
}
