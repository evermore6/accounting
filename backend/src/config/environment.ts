import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'burjo_accounting',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  app: {
    approvalThreshold: parseInt(process.env.APPROVAL_THRESHOLD || '500000'),
    currency: process.env.CURRENCY || 'IDR'
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  }
};

export default config;
