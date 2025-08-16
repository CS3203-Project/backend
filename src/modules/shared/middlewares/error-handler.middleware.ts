import type { Request, Response, NextFunction } from 'express';
import { DomainError } from '../errors/domain-errors.js';
import { ApiResponse } from '../types/common.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error caught by global handler:', error);

  // Handle domain errors
  if (error instanceof DomainError) {
    const response: ApiResponse = {
      success: false,
      message: error.message,
      ...(error.details && { errors: error.details })
    };

    res.status(error.status).json(response);
    return;
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    // Handle unique constraint violations
    if (prismaError.code === 'P2002') {
      const response: ApiResponse = {
        success: false,
        message: 'A record with this data already exists',
        errors: [{
          field: prismaError.meta?.target?.[0] || 'unknown',
          message: 'Value must be unique'
        }]
      };
      res.status(409).json(response);
      return;
    }

    // Handle foreign key constraint violations
    if (prismaError.code === 'P2003') {
      const response: ApiResponse = {
        success: false,
        message: 'Referenced record does not exist'
      };
      res.status(400).json(response);
      return;
    }
  }

  // Handle validation errors from Joi
  if (error.name === 'ValidationError') {
    const response: ApiResponse = {
      success: false,
      message: 'Validation failed',
      errors: (error as any).details?.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message
      })) || []
    };
    res.status(400).json(response);
    return;
  }

  // Default error response
  const response: ApiResponse = {
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  };

  res.status(500).json(response);
};