#!/usr/bin/env node

/**
 * Admin Account Creation Script
 *
 * This script creates an initial admin account for the Bachelor Society application.
 * It follows industry best practices for database seeding.
 *
 * Usage:
 *   node scripts/create-admin.js
 *
 * Environment Variables:
 *   ADMIN_EMAIL - Email for the admin account (default: admin@example.com)
 *   ADMIN_PASSWORD - Password for the admin account (default: admin123)
 *   ADMIN_USERNAME - Username for the admin account (default: admin)
 */

const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bachelor_society',
  port: process.env.DB_PORT || 3306
};

// Admin account details from environment variables
const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
const adminUsername = process.env.ADMIN_USERNAME || 'admin';

async function createAdminAccount() {
  console.log('🚀 Starting admin account creation...');
  console.log(`📧 Email: ${adminEmail}`);
  console.log(`👤 Username: ${adminUsername}`);
  console.log(`🔒 Password: ${adminPassword ? '[SET]' : '[DEFAULT]'}`);

  const connection = mysql.createConnection(dbConfig);

  try {
    // Connect to database
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          console.error('❌ Database connection failed:', err.message);
          reject(err);
        } else {
          console.log('✅ Connected to database');
          resolve();
        }
      });
    });

    // Check if admin already exists
    console.log('🔍 Checking for existing admin account...');
    const existingAdmin = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT id, username, email, role FROM users WHERE email = ? OR username = ?',
        [adminEmail, adminUsername],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });

    if (existingAdmin.length > 0) {
      const user = existingAdmin[0];
      if (user.role === 'admin') {
        console.log('ℹ️  Admin account already exists!');
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        return;
      } else {
        console.log('🔄 Promoting existing user to admin...');
        await new Promise((resolve, reject) => {
          connection.query(
            'UPDATE users SET role = ? WHERE id = ?',
            ['admin', user.id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        console.log('✅ User promoted to admin successfully!');
        return;
      }
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin account
    console.log('👤 Creating admin account...');
    const result = await new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO users (username, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, NOW())',
        [adminUsername, adminEmail, hashedPassword, 'admin'],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    console.log('✅ Admin account created successfully!');
    console.log(`   ID: ${result.insertId}`);
    console.log(`   Username: ${adminUsername}`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Role: admin`);

  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
    process.exit(1);
  } finally {
    connection.end();
  }
}

// Run the script
if (require.main === module) {
  createAdminAccount()
    .then(() => {
      console.log('\n🎉 Admin account setup complete!');
      console.log('You can now login with:');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { createAdminAccount };
