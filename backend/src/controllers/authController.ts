import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { auditLogMiddleware } from '../middleware/auditLog';
import { AuthRequest } from '../middleware/auth';

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await authService.login({ email, password });

      // Log login
      await auditLogMiddleware(
        { ...req, user: { id: result.user.id } } as AuthRequest,
        'login',
        'user',
        result.user.id
      );

      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  },

  async register(req: Request, res: Response) {
    try {
      const user = await authService.register(req.body);

      res.status(201).json({
        message: 'User registered successfully',
        user
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async changePassword(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { oldPassword, newPassword } = req.body;

      await authService.changePassword(req.user.id, oldPassword, newPassword);

      res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async logout(req: AuthRequest, res: Response) {
    try {
      if (req.user) {
        await auditLogMiddleware(req, 'logout', 'user', req.user.id);
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      res.json({ user: req.user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
