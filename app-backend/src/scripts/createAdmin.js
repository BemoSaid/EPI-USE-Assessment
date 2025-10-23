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
    const email = 'bemosaid3@gmail.com';
    const password = 'Bemo123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'c' + Date.now().toString(36) + Math.random().toString(36).substring(2, 15);

    // 1. Create the user
    await pool.query(
      `INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [userId, email, hashedPassword, 'System Administrator', 'ADMIN']
    );

    // Find the next employee number
    const result = await pool.query('SELECT MAX(id) as maxId FROM employees');
    const maxId = result.rows[0].maxid || 0;
    const employeeNumber = `E${Number(maxId) + 1}`;

    // 2. Create the employee as CEO, linked to the user
    await pool.query(
      `INSERT INTO employees ("employeeNumber", name, surname, "birthDate", salary, role, email, "phoneNumber", department, "userId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
      [
        employeeNumber,
        'System',
        'Administrator',
        '1970-01-01',
        200000,
        'CEO',
        email,
        '0123456789',
        'Management',
        userId
      ]
    );

    console.log('Admin user and CEO employee created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    await pool.end();
  }
};

createAdmin();