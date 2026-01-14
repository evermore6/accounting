// Audit logging middleware

import { Request, Response, NextFunction } from 'express';
import { executeQuery } from '../config/database';
import logger from '../utils/logger';

export interface AuditLog {
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  ipAddress: string;
  userAgent: string;
  requestBody: any;
  responseStatus: number;
  timestamp: Date;
}

export const auditLog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Store original res.json
  const originalJson = res.json.bind(res);

  // Override res.json to capture response
  res.json = function (body: any) {
    // Log the action
    logAudit(req, res.statusCode, body);
    
    // Call original json
    return originalJson(body);
  };

  next();
};

const logAudit = async (
  req: Request,
  statusCode: number,
  responseBody: any
) => {
  try {
    const userId = req.user?.userId || null;
    const action = `${req.method} ${req.path}`;
    const resource = extractResource(req.path);
    const resourceId = extractResourceId(req.path, responseBody);
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Only log important actions (POST, PUT, DELETE, PATCH)
    const shouldLog = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);

    if (shouldLog) {
      logger.info('Audit log', {
        userId,
        action,
        resource,
        resourceId,
        ipAddress,
        statusCode,
      });

      // Save to database
      await saveAuditLog({
        userId,
        action,
        resource,
        resourceId,
        ipAddress,
        userAgent,
        requestBody: sanitizeBody(req.body),
        responseStatus: statusCode,
        timestamp: new Date(),
      });
    }
  } catch (error) {
    // Don't fail the request if audit logging fails
    logger.error('Failed to save audit log', { error });
  }
};

const extractResource = (path: string): string => {
  const parts = path.split('/').filter(Boolean);
  return parts[1] || 'unknown'; // Get the resource name (e.g., 'users', 'transactions')
};

const extractResourceId = (path: string, responseBody: any): string | null => {
  // Try to extract ID from path
  const parts = path.split('/').filter(Boolean);
  const lastPart = parts[parts.length - 1];
  
  if (lastPart && /^[0-9a-f-]{36}$/i.test(lastPart)) {
    return lastPart;
  }

  // Try to extract ID from response
  if (responseBody?.data?.id) {
    return responseBody.data.id;
  }

  return null;
};

const sanitizeBody = (body: any): any => {
  if (!body) return null;

  const sanitized = { ...body };
  
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.refreshToken;

  return sanitized;
};

const saveAuditLog = async (log: AuditLog): Promise<void> => {
  try {
    const query = `
      INSERT INTO audit_logs (
        user_id, action, resource, resource_id, ip_address, 
        user_agent, request_body, response_status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    await executeQuery(query, [
      log.userId,
      log.action,
      log.resource,
      log.resourceId,
      log.ipAddress,
      log.userAgent,
      JSON.stringify(log.requestBody),
      log.responseStatus,
      log.timestamp,
    ]);
  } catch (error) {
    // Table might not exist yet, silently fail
    logger.debug('Audit log table not ready', { error });
  }
};
