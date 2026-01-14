import { seedChartOfAccounts } from './chartOfAccounts';
import { seedUsers } from './sampleUsers';
import { seedTransactions } from './sampleTransactions';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'burjo_accounting',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

async function runSeeds() {
  try {
    console.log('Starting seed process...');
    
    await seedChartOfAccounts();
    await seedUsers();
    await seedTransactions();
    
    console.log('All seeds completed successfully!');
  } catch (error) {
    console.error('Seed process failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeeds();
