import type { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/errors.js';
import { config } from '../config/index.js';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(StatusCodes.NOT_FOUND, `Route ${req.method} ${req.path} not found`));
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    const errorResponse: Record<string, unknown> = {
      message: err.message,
      code: err.code,
    };
    if (err.details) {
      errorResponse.details = err.details;
    }
    res.status(err.statusCode).json({
      success: false,
      error: errorResponse,
    });
    return;
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  const statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  const message = config.env === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(config.env !== 'production' && { stack: err.stack }),
    },
  });
}
