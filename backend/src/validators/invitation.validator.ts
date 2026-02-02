import { z } from 'zod';
import { OrganizationRole } from '@prisma/client';

export const createInvitationSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z
    .nativeEnum(OrganizationRole)
    .refine((role) => role !== OrganizationRole.OWNER, {
      message: 'Cannot invite as owner',
    })
    .default(OrganizationRole.MEMBER),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
