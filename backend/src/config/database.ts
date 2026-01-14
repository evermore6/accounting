import { Pool, PoolClient } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'accounting_db',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const getConnection = async (): Promise<PoolClient> => {
  return await pool.connect();
};

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', {
      text,
      duration,
      rows: result.rowCount,
    });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const initializeDatabase = async (): Promise<void> => {
  const client = await getConnection();
  try {
    // Read and execute migration files
    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    console.log(`Found ${files.length} migration files`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      console.log(`Executing migration: ${file}`);
      await client.query(sql);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const closePool = async (): Promise<void> => {
  await pool.end();
};

export default pool;
