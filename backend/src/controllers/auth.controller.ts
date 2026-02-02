import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as authService from '../services/auth.service.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { RegisterInput, LoginInput } from '../validators/auth.validator.js';

export async function register(req: Request, res: Response) {
  const data = req.body as RegisterInput;
  const result = await authService.register(data);

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: result,
  });
}

export async function login(req: Request, res: Response) {
  const data = req.body as LoginInput;
  const result = await authService.login(data);

  res.status(StatusCodes.OK).json({
    success: true,
    data: result,
  });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;
  const tokens = await authService.refresh(refreshToken);

  res.status(StatusCodes.OK).json({
    success: true,
    data: tokens,
  });
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Logged out successfully',
  });
}

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  const user = await authService.getProfile(req.user.id);

  res.status(StatusCodes.OK).json({
    success: true,
    data: user,
  });
}
