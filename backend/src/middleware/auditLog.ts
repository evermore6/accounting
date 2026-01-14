import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import pool from '../config/database';

export const auditLog = (action: string, entityType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any): Response {
      // Log the action after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');
        const entityId = body?.id || req.params.id;

        pool.query(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [userId, action, entityType, entityId, JSON.stringify(body), ipAddress, userAgent]
        ).catch(err => console.error('Audit log error:', err));
      }

      return originalJson(body);
    };

    next();
  };
};

export const auditLogMiddleware = async (
  req: AuthRequest,
  action: string,
  entityType: string,
  entityId?: number,
  oldValues?: any,
  newValues?: any
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        action,
        entityType,
        entityId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        userAgent
      ]
    );
  } catch (error) {
    console.error('Audit log error:', error);
  }
};
