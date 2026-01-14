// Main server entry point

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/environment';
import { testDatabaseConnection } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { auditLog } from './middleware/auditLog';
import logger from './utils/logger';

// Import routes
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import journalRoutes from './routes/journals';
import reportRoutes from './routes/reports';
import userRoutes from './routes/users';
import inventoryRoutes from './routes/inventory';

// Create Express app
const app: Express = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
})); // CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging
app.use((req: Request, res: Response, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  next();
});

// Audit logging
app.use(auditLog);

// Health check endpoints
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

app.get('/readiness', async (req: Request, res: Response) => {
  try {
    const dbHealthy = await testDatabaseConnection();
    
    if (dbHealthy) {
      res.json({
        status: 'ready',
        database: 'connected',
        timestamp: new Date(),
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        database: 'disconnected',
        timestamp: new Date(),
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      database: 'error',
      timestamp: new Date(),
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Burjo Accounting System API',
    version: '1.0.0',
    description: 'Complete web-based accounting system for small restaurants',
    endpoints: {
      auth: '/api/auth',
      transactions: '/api/transactions',
      journals: '/api/journals',
      reports: '/api/reports',
      users: '/api/users',
      inventory: '/api/inventory',
    },
    health: '/health',
    readiness: '/readiness',
    timestamp: new Date(),
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    logger.info('Testing database connection...');
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }

    logger.info('Database connected successfully');

    // Start listening
    const port = config.port;
    app.listen(port, () => {
      logger.info(`Server started successfully`, {
        port,
        environment: config.nodeEnv,
        apiBaseUrl: config.apiBaseUrl,
      });
      
      console.log('');
      console.log('╔════════════════════════════════════════════════════╗');
      console.log('║   Burjo Accounting System - API Server Running    ║');
      console.log('╠════════════════════════════════════════════════════╣');
      console.log(`║   Environment: ${config.nodeEnv.padEnd(35)} ║`);
      console.log(`║   Port: ${port.toString().padEnd(42)} ║`);
      console.log(`║   API URL: ${config.apiBaseUrl.padEnd(39)} ║`);
      console.log('╠════════════════════════════════════════════════════╣');
      console.log('║   Endpoints:                                       ║');
      console.log('║   - GET  /                   (API Info)            ║');
      console.log('║   - GET  /health             (Health Check)        ║');
      console.log('║   - GET  /readiness          (Readiness Check)     ║');
      console.log('║   - POST /api/auth/login     (Login)               ║');
      console.log('║   - GET  /api/reports/*      (Financial Reports)   ║');
      console.log('║   - *    /api/*              (All API Routes)      ║');
      console.log('╚════════════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled rejection', { reason });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

export default app;
