import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';
import bcrypt from 'bcrypt';
import { auditLogMiddleware } from '../middleware/auditLog';

export const userController = {
  async getUsers(req: AuthRequest, res: Response) {
    try {
      const result = await pool.query(
        `SELECT id, username, email, full_name, role, is_active, last_login, created_at
         FROM users
         ORDER BY created_at DESC`
      );

      res.json({ users: result.rows });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createUser(req: AuthRequest, res: Response) {
    try {
      const { username, email, password, full_name, role } = req.body;

      const passwordHash = await bcrypt.hash(password, 10);

      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, username, email, full_name, role`,
        [username, email, passwordHash, full_name, role]
      );

      await auditLogMiddleware(req, 'create', 'user', result.rows[0].id, null, result.rows[0]);

      res.status(201).json({
        message: 'User created successfully',
        user: result.rows[0]
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { username, email, full_name, role, is_active } = req.body;

      // Get old values for audit
      const oldData = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

      const result = await pool.query(
        `UPDATE users
         SET username = COALESCE($1, username),
             email = COALESCE($2, email),
             full_name = COALESCE($3, full_name),
             role = COALESCE($4, role),
             is_active = COALESCE($5, is_active),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING id, username, email, full_name, role, is_active`,
        [username, email, full_name, role, is_active, id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      await auditLogMiddleware(req, 'update', 'user', parseInt(id), oldData.rows[0], result.rows[0]);

      res.json({
        message: 'User updated successfully',
        user: result.rows[0]
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      // Prevent deleting yourself
      if (req.user?.id === parseInt(id)) {
        res.status(400).json({ error: 'Cannot delete your own account' });
        return;
      }

      const oldData = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

      const result = await pool.query(
        'UPDATE users SET is_active = false WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      await auditLogMiddleware(req, 'delete', 'user', parseInt(id), oldData.rows[0]);

      res.json({ message: 'User deactivated successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
