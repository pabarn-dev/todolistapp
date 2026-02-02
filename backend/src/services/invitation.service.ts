import { InvitationStatus, OrganizationRole } from '@prisma/client';
import { prisma } from '../config/database.js';
import { generateToken } from '../utils/helpers.js';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors.js';
import type { CreateInvitationInput } from '../validators/invitation.validator.js';

const INVITATION_EXPIRY_DAYS = 7;

export async function createInvitation(orgId: string, senderId: string, data: CreateInvitationInput) {
  // Check if user is already a member
  const existingMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId: orgId,
      user: { email: data.email.toLowerCase() },
    },
  });

  if (existingMember) {
    throw new ConflictError('User is already a member of this organization');
  }

  // Check for existing pending invitation
  const existingInvitation = await prisma.invitation.findUnique({
    where: { organizationId_email: { organizationId: orgId, email: data.email.toLowerCase() } },
  });

  if (existingInvitation && existingInvitation.status === InvitationStatus.PENDING) {
    throw new ConflictError('An invitation is already pending for this email');
  }

  // Delete old invitation if exists
  if (existingInvitation) {
    await prisma.invitation.delete({ where: { id: existingInvitation.id } });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

  const invitation = await prisma.invitation.create({
    data: {
      organizationId: orgId,
      email: data.email.toLowerCase(),
      role: data.role,
      senderId,
      token: generateToken(),
      expiresAt,
    },
    include: {
      organization: { select: { id: true, name: true, slug: true } },
      sender: { select: { id: true, name: true, email: true } },
    },
  });

  return invitation;
}

export async function getInvitations(orgId: string) {
  const invitations = await prisma.invitation.findMany({
    where: { organizationId: orgId },
    include: {
      sender: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return invitations;
}

export async function getInvitationByToken(token: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      organization: { select: { id: true, name: true, slug: true, logoUrl: true } },
      sender: { select: { id: true, name: true } },
    },
  });

  if (!invitation) {
    throw new NotFoundError('Invitation not found');
  }

  if (invitation.status !== InvitationStatus.PENDING) {
    throw new BadRequestError(`Invitation has already been ${invitation.status.toLowerCase()}`);
  }

  if (invitation.expiresAt < new Date()) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.EXPIRED },
    });
    throw new BadRequestError('Invitation has expired');
  }

  return invitation;
}

export async function acceptInvitation(token: string, userId: string, userEmail: string) {
  const invitation = await getInvitationByToken(token);

  // Verify email matches
  if (invitation.email !== userEmail.toLowerCase()) {
    throw new BadRequestError('This invitation was sent to a different email address');
  }

  // Check if already a member
  const existingMember = await prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId, organizationId: invitation.organizationId } },
  });

  if (existingMember) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.ACCEPTED, acceptedAt: new Date() },
    });
    throw new ConflictError('You are already a member of this organization');
  }

  // Add member and update invitation in transaction
  const [member] = await prisma.$transaction([
    prisma.organizationMember.create({
      data: {
        userId,
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.ACCEPTED, acceptedAt: new Date() },
    }),
  ]);

  return member;
}

export async function revokeInvitation(invitationId: string, orgId: string) {
  const invitation = await prisma.invitation.findFirst({
    where: { id: invitationId, organizationId: orgId },
  });

  if (!invitation) {
    throw new NotFoundError('Invitation not found');
  }

  if (invitation.status !== InvitationStatus.PENDING) {
    throw new BadRequestError('Can only revoke pending invitations');
  }

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: InvitationStatus.REVOKED },
  });
}
