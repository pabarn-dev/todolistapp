import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', code?: string, details?: unknown) {
    super(StatusCodes.BAD_REQUEST, message, code, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code?: string) {
    super(StatusCodes.UNAUTHORIZED, message, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code?: string) {
    super(StatusCodes.FORBIDDEN, message, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code?: string) {
    super(StatusCodes.NOT_FOUND, message, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists', code?: string) {
    super(StatusCodes.CONFLICT, message, code);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, message, 'VALIDATION_ERROR', details);
  }
}
