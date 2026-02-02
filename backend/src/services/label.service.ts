import { prisma } from '../config/database.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import type { CreateLabelInput, UpdateLabelInput } from '../validators/label.validator.js';

export async function createLabel(orgId: string, data: CreateLabelInput) {
  const existing = await prisma.label.findUnique({
    where: { organizationId_name: { organizationId: orgId, name: data.name } },
  });

  if (existing) {
    throw new ConflictError('Label with this name already exists');
  }

  const label = await prisma.label.create({
    data: {
      organizationId: orgId,
      name: data.name,
      color: data.color,
    },
  });

  return label;
}

export async function getLabels(orgId: string) {
  const labels = await prisma.label.findMany({
    where: { organizationId: orgId },
    orderBy: { name: 'asc' },
  });

  return labels;
}

export async function updateLabel(labelId: string, orgId: string, data: UpdateLabelInput) {
  const label = await prisma.label.findFirst({
    where: { id: labelId, organizationId: orgId },
  });

  if (!label) {
    throw new NotFoundError('Label not found');
  }

  // Check name uniqueness if updating name
  if (data.name && data.name !== label.name) {
    const existing = await prisma.label.findUnique({
      where: { organizationId_name: { organizationId: orgId, name: data.name } },
    });

    if (existing) {
      throw new ConflictError('Label with this name already exists');
    }
  }

  const updated = await prisma.label.update({
    where: { id: labelId },
    data,
  });

  return updated;
}

export async function deleteLabel(labelId: string, orgId: string) {
  const label = await prisma.label.findFirst({
    where: { id: labelId, organizationId: orgId },
  });

  if (!label) {
    throw new NotFoundError('Label not found');
  }

  await prisma.label.delete({
    where: { id: labelId },
  });
}
