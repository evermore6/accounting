// User model and database queries

import { executeQuery, getClient } from '../config/database';
import { User, UserRole, UserStatus } from '../types';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class UserModel {
  static async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, first_name as "firstName", last_name as "lastName", 
             phone, role, status, created_at as "createdAt", 
             updated_at as "updatedAt", deleted_at as "deletedAt"
      FROM users
      WHERE id = $1 AND deleted_at IS NULL
    `;
    
    const result = await executeQuery(query, [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, first_name as "firstName", last_name as "lastName", 
             phone, role, status, created_at as "createdAt", 
             updated_at as "updatedAt", deleted_at as "deletedAt"
      FROM users
      WHERE email = $1 AND deleted_at IS NULL
    `;
    
    const result = await executeQuery(query, [email]);
    return result.rows[0] || null;
  }

  static async findByEmailWithPassword(email: string): Promise<any | null> {
    const query = `
      SELECT id, email, password_hash, first_name as "firstName", last_name as "lastName", 
             phone, role, status, created_at as "createdAt", 
             updated_at as "updatedAt", deleted_at as "deletedAt"
      FROM users
      WHERE email = $1 AND deleted_at IS NULL
    `;
    
    const result = await executeQuery(query, [email]);
    return result.rows[0] || null;
  }

  static async findAll(filters?: {
    role?: UserRole;
    status?: UserStatus;
    page?: number;
    limit?: number;
  }): Promise<{ users: User[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    let whereConditions = ['deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.role) {
      whereConditions.push(`role = $${paramIndex}`);
      params.push(filters.role);
      paramIndex++;
    }

    if (filters?.status) {
      whereConditions.push(`status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT id, email, first_name as "firstName", last_name as "lastName", 
             phone, role, status, created_at as "createdAt", 
             updated_at as "updatedAt"
      FROM users
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM users
      WHERE ${whereClause}
    `;

    params.push(limit, offset);

    const [usersResult, countResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, params.slice(0, -2)),
    ]);

    return {
      users: usersResult.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  static async create(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
  }): Promise<User> {
    const id = uuidv4();
    const passwordHash = await bcrypt.hash(userData.password, 10);

    const query = `
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, phone, role, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, first_name as "firstName", last_name as "lastName", 
                phone, role, status, created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await executeQuery(query, [
      id,
      userData.email,
      passwordHash,
      userData.firstName,
      userData.lastName,
      userData.phone || null,
      userData.role,
      UserStatus.ACTIVE,
    ]);

    return result.rows[0];
  }

  static async update(
    id: string,
    updates: Partial<{
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      role: UserRole;
      status: UserStatus;
    }>
  ): Promise<User | null> {
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updates.email !== undefined) {
      fields.push(`email = $${paramIndex}`);
      params.push(updates.email);
      paramIndex++;
    }

    if (updates.firstName !== undefined) {
      fields.push(`first_name = $${paramIndex}`);
      params.push(updates.firstName);
      paramIndex++;
    }

    if (updates.lastName !== undefined) {
      fields.push(`last_name = $${paramIndex}`);
      params.push(updates.lastName);
      paramIndex++;
    }

    if (updates.phone !== undefined) {
      fields.push(`phone = $${paramIndex}`);
      params.push(updates.phone);
      paramIndex++;
    }

    if (updates.role !== undefined) {
      fields.push(`role = $${paramIndex}`);
      params.push(updates.role);
      paramIndex++;
    }

    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex}`);
      params.push(updates.status);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND deleted_at IS NULL
      RETURNING id, email, first_name as "firstName", last_name as "lastName", 
                phone, role, status, created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await executeQuery(query, params);
    return result.rows[0] || null;
  }

  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const query = `
      UPDATE users
      SET password_hash = $1, updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
    `;

    const result = await executeQuery(query, [passwordHash, id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  static async delete(id: string): Promise<boolean> {
    const query = `
      UPDATE users
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `;

    const result = await executeQuery(query, [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default UserModel;
