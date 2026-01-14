// Authentication service

import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import UserModel from '../models/User';
import { AuthToken, JwtPayload, User } from '../types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  static async login(email: string, password: string): Promise<{ user: User; tokens: AuthToken }> {
    // Find user with password
    const userWithPassword = await UserModel.findByEmailWithPassword(email);

    if (!userWithPassword) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    // Verify password
    const isValidPassword = await UserModel.verifyPassword(password, userWithPassword.password_hash);

    if (!isValidPassword) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    // Check if user is active
    if (userWithPassword.status !== 'active') {
      throw new AppError('Account is not active', 401);
    }

    // Remove password from user object
    const { password_hash, ...user } = userWithPassword;

    // Generate tokens
    const tokens = this.generateTokens(user);

    return { user, tokens };
  }

  static async refreshToken(refreshToken: string): Promise<AuthToken> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as JwtPayload;

      // Find user
      const user = await UserModel.findById(decoded.userId);

      if (!user) {
        throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
      }

      if (user.status !== 'active') {
        throw new AppError('Account is not active', 401);
      }

      // Generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(ERROR_MESSAGES.TOKEN_EXPIRED, 401);
      }
      throw new AppError(ERROR_MESSAGES.TOKEN_INVALID, 401);
    }
  }

  static generateTokens(user: User): AuthToken {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiration,
    });

    const refreshToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiration,
    });

    // Calculate expiration time in seconds
    const expiresIn = this.parseExpiration(config.jwt.expiration);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(ERROR_MESSAGES.TOKEN_EXPIRED, 401);
      }
      throw new AppError(ERROR_MESSAGES.TOKEN_INVALID, 401);
    }
  }

  private static parseExpiration(expiration: string): number {
    const units: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const match = expiration.match(/^(\d+)([smhd])$/);
    
    if (!match) {
      return 86400; // Default to 24 hours
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    return value * (units[unit] || 1);
  }
}

export default AuthService;
