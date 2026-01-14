import { Pool, PoolConfig } from 'pg';
import { config } from './environment';

// Create PostgreSQL connection pool
const poolConfig: PoolConfig = {
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of connections in pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (error: Error) => {
  console.error('Unexpected error on idle client', error);
});

// Test database connection
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Execute query
export const executeQuery = async (
  query: string,
  params?: (string | number | boolean | null)[]
) => {
  try {
    const result = await pool.query(query, params);
    return result;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
};

// Get a client from the pool for transactions
export const getClient = async () => {
  return await pool.connect();
};

// Close the pool
export const closePool = async (): Promise<void> => {
  await pool.end();
};

export { pool };
export default pool;
