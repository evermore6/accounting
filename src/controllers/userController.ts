// User controller

import { Request, Response } from 'express';
import UserModel from '../models/User';
import { asyncHandler } from '../middleware/errorHandler';
import { SUCCESS_MESSAGES } from '../config/constants';
import { UserRole, UserStatus } from '../types';

export class UserController {
  static createUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, phone, role } = req.body;

    // Check if user already exists
    const existing = await UserModel.findByEmail(email);
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
        timestamp: new Date(),
      });
    }

    const user = await UserModel.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      role: role as UserRole,
    });

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATE_SUCCESS,
      data: user,
      timestamp: new Date(),
    });
  });

  static getUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
      timestamp: new Date(),
    });
  });

  static listUsers = asyncHandler(async (req: Request, res: Response) => {
    const { role, status, page, limit } = req.query;

    const filters: any = {};
    
    if (role) filters.role = role as UserRole;
    if (status) filters.status = status as UserStatus;
    if (page) filters.page = parseInt(page as string, 10);
    if (limit) filters.limit = parseInt(limit as string, 10);

    const result = await UserModel.findAll(filters);

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: result.users,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total: result.total,
        totalPages: Math.ceil(result.total / (filters.limit || 20)),
      },
      timestamp: new Date(),
    });
  });

  static updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const user = await UserModel.update(id, updates);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
      data: user,
      timestamp: new Date(),
    });
  });

  static deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const deleted = await UserModel.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.DELETE_SUCCESS,
      timestamp: new Date(),
    });
  });

  static updateUserPassword = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    const updated = await UserModel.updatePassword(id, newPassword);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: 'Password updated successfully',
      timestamp: new Date(),
    });
  });
}

export default UserController;
