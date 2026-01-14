// Request validation middleware

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      
      return next(new AppError(errorMessage, 400));
    }

    // Replace req.body with validated value
    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      
      return next(new AppError(errorMessage, 400));
    }

    req.query = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      
      return next(new AppError(errorMessage, 400));
    }

    req.params = value;
    next();
  };
};

// Common validation schemas
export const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),

  createUser: Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().optional(),
    role: Joi.string().valid('admin', 'accountant', 'manager', 'viewer').required(),
    password: Joi.string().min(8).required(),
  }),

  updateUser: Joi.object({
    email: Joi.string().email().optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    phone: Joi.string().optional(),
    role: Joi.string().valid('admin', 'accountant', 'manager', 'viewer').optional(),
    status: Joi.string().valid('active', 'inactive', 'suspended').optional(),
  }),

  createTransaction: Joi.object({
    date: Joi.date().required(),
    description: Joi.string().required(),
    amount: Joi.number().positive().required(),
    transactionType: Joi.string().required(),
    entries: Joi.array().items(
      Joi.object({
        accountCode: Joi.string().length(4).required(),
        debit: Joi.number().min(0).required(),
        credit: Joi.number().min(0).required(),
      })
    ).min(2).required(),
  }),

  createJournal: Joi.object({
    date: Joi.date().required(),
    description: Joi.string().required(),
    entries: Joi.array().items(
      Joi.object({
        accountCode: Joi.string().length(4).required(),
        debit: Joi.number().min(0).required(),
        credit: Joi.number().min(0).required(),
      })
    ).min(2).required(),
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};
