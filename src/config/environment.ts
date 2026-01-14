import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  apiBaseUrl: string;
  database: DatabaseConfig;
  jwt: JwtConfig;
  smtp: SmtpConfig;
  logging: LoggingConfig;
  cors: CorsConfig;
  fileUpload: FileUploadConfig;
}

interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
  ssl: boolean;
}

interface JwtConfig {
  secret: string;
  expiration: string;
  refreshExpiration: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
}

interface LoggingConfig {
  level: string;
  format: string;
}

interface CorsConfig {
  origin: string;
}

interface FileUploadConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = parseInt(process.env.PORT || '3000', 10);
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

  // Validate required environment variables
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  if (!process.env.DB_PASSWORD) {
    throw new Error('DB_PASSWORD environment variable is not set');
  }

  const config: EnvironmentConfig = {
    nodeEnv,
    port,
    apiBaseUrl,
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      name: process.env.DB_NAME || 'burjo_accounting',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true',
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiration: process.env.JWT_EXPIRATION || '24h',
      refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    },
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
      from: process.env.SMTP_FROM || 'noreply@burjoaccounting.com',
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: process.env.LOG_FORMAT || 'json',
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    },
    fileUpload: {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
      allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,xlsx,csv,jpg,png').split(','),
    },
  };

  return config;
};

export const config = getEnvironmentConfig();
export default config;
