import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as labelService from '../services/label.service.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { CreateLabelInput, UpdateLabelInput } from '../validators/label.validator.js';

export async function create(req: AuthenticatedRequest, res: Response) {
  const data = req.body as CreateLabelInput;
  const label = await labelService.createLabel(req.organizationMember!.organizationId, data);

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: label,
  });
}

export async function getAll(req: AuthenticatedRequest, res: Response) {
  const labels = await labelService.getLabels(req.organizationMember!.organizationId);

  res.status(StatusCodes.OK).json({
    success: true,
    data: labels,
  });
}

export async function update(req: AuthenticatedRequest, res: Response) {
  const labelId = req.params.labelId as string;
  const data = req.body as UpdateLabelInput;
  const label = await labelService.updateLabel(labelId, req.organizationMember!.organizationId, data);

  res.status(StatusCodes.OK).json({
    success: true,
    data: label,
  });
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  const labelId = req.params.labelId as string;
  await labelService.deleteLabel(labelId, req.organizationMember!.organizationId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Label deleted',
  });
}
