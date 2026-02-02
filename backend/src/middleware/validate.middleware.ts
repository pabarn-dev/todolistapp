import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

type ValidateTarget = 'body' | 'query' | 'params';

export function validate<T extends z.ZodType>(
  schema: T,
  target: ValidateTarget = 'body'
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));

      throw new ValidationError('Validation failed', errors);
    }

    req[target] = result.data;
    next();
  };
}
