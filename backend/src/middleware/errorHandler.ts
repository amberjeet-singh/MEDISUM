import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

import { ZodError } from 'zod';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError || err.name === 'ZodError' || Array.isArray((err as any).errors) || Array.isArray((err as any).issues)) {
    statusCode = 400;
    const issues = (err as any).errors || (err as any).issues || [];
    message = `Validation Error: ${issues.map((e: any) => e.message || String(e)).join(', ')}`;
  } else if (err.message && err.message.includes('is required')) {
    statusCode = 400;
    message = err.message;
  }

  // Consistent response pattern
  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code: statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'API_ERROR',
      message: message,
      // Only include stack in development
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};
