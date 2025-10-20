import bcrypt from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

const createAdmin = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const hashedPassword = await bcrypt.hash('Bemo123!', 10);
    const userId = 'c' + Date.now().toString(36) + Math.random().toString(36).substring(2, 15);

    await pool.query(
      `INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [userId, 'bemosaid3@gmail.com', hashedPassword, 'System Administrator', 'ADMIN']
    );

    console.log('Admin created successfully!');
    console.log('Email: bemosaid3@gmail.com');
    console.log('Password: Bemo123!');
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    await pool.end();
  }
};

createAdmin();