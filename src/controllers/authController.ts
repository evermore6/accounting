// Authentication controller

import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/authService';
import UserModel from '../models/User';
import { asyncHandler } from '../middleware/errorHandler';
import { SUCCESS_MESSAGES } from '../config/constants';

export class AuthController {
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await AuthService.login(email, password);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      data: {
        user: result.user,
        tokens: result.tokens,
      },
      timestamp: new Date(),
    });
  });

  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const tokens = await AuthService.refreshToken(refreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { tokens },
      timestamp: new Date(),
    });
  });

  static getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        timestamp: new Date(),
      });
    }

    const user = await UserModel.findById(req.user.userId);

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
      timestamp: new Date(),
    });
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    // In a production app, you'd invalidate the token here
    // For now, we'll just return success
    res.json({
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
      timestamp: new Date(),
    });
  });

  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        timestamp: new Date(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const userWithPassword = await UserModel.findByEmailWithPassword(req.user.email);
    
    if (!userWithPassword) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date(),
      });
    }

    const isValidPassword = await UserModel.verifyPassword(
      currentPassword,
      userWithPassword.password_hash
    );

    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
        timestamp: new Date(),
      });
    }

    // Update password
    await UserModel.updatePassword(req.user.userId, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
      timestamp: new Date(),
    });
  });
}

export default AuthController;
