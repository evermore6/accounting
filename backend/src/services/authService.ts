import bcrypt from 'bcrypt';
import { query } from '../config/database';
import { generateToken } from '../middleware/auth';
import { User } from '../models/User';

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface UpdatePayload {
  firstName?: string;
  lastName?: string;
}

export const registerUser = async (payload: RegisterPayload): Promise<User & { token: string }> => {
  const { email, password, firstName, lastName, role } = payload;

  // Check if user already exists
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const result = await query(
    'INSERT INTO users (email, password_hash, first_name, last_name, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, email, first_name, last_name, role, created_at',
    [email, hashedPassword, firstName, lastName, role]
  );

  const user = result.rows[0];
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    createdAt: user.created_at,
    token,
  };
};

export const loginUser = async (email: string, password: string): Promise<User & { token: string }> => {
  // Find user by email
  const result = await query('SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = $1', [
    email,
  ]);

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = result.rows[0];

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    token,
  };
};

export const getUserById = async (id: string): Promise<User> => {
  const result = await query('SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  const user = result.rows[0];
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    createdAt: user.created_at,
  };
};

export const updateUser = async (id: string, payload: UpdatePayload): Promise<User> => {
  const { firstName, lastName } = payload;

  const result = await query(
    'UPDATE users SET first_name = COALESCE($2, first_name), last_name = COALESCE($3, last_name), updated_at = NOW() WHERE id = $1 RETURNING id, email, first_name, last_name, role, created_at',
    [id, firstName, lastName]
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  const user = result.rows[0];
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    createdAt: user.created_at,
  };
};

export const changePassword = async (id: string, currentPassword: string, newPassword: string): Promise<void> => {
  // Get user
  const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [id]);

  if (userResult.rows.length === 0) {
    throw new Error('User not found');
  }

  // Verify current password
  const user = userResult.rows[0];
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await query('UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1', [id, hashedPassword]);
};
