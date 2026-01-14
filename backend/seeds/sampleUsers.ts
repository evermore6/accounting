import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'burjo_accounting',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

const sampleUsers = [
  {
    username: 'pakbudi',
    email: 'pakbudi@burjo.local',
    password: 'password123',
    full_name: 'Pak Budi',
    role: 'owner'
  },
  {
    username: 'siti',
    email: 'siti@burjo.local',
    password: 'password123',
    full_name: 'Ibu Siti',
    role: 'admin_accounting'
  },
  {
    username: 'rino',
    email: 'rino@burjo.local',
    password: 'password123',
    full_name: 'Rino',
    role: 'staff'
  },
  {
    username: 'rina',
    email: 'rina@burjo.local',
    password: 'password123',
    full_name: 'Rina',
    role: 'staff'
  }
];

export async function seedUsers() {
  const client = await pool.connect();
  
  try {
    console.log('Seeding users...');
    
    for (const user of sampleUsers) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      
      await client.query(
        `INSERT INTO users (username, email, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING`,
        [user.username, user.email, passwordHash, user.full_name, user.role]
      );
    }
    
    console.log('✓ Users seeded successfully!');
  } catch (error) {
    console.error('Seeding users failed:', error);
    throw error;
  } finally {
    client.release();
  }
}
