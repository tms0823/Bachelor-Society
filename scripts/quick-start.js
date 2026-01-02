#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Bachelor Society - Ultra Quick Start');
console.log('======================================\n');

// Check if .env exists, create with defaults if not
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file with default settings...');

  // Read .env.example and copy it
  if (fs.existsSync(envExamplePath)) {
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env created from .env.example');
  } else {
    // Fallback: create basic .env
    const basicEnv = `DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=bachelor_society
JWT_SECRET=change_this_to_random_string

# File uploads are stored locally in the uploads/ directory
`;
    fs.writeFileSync(envPath, basicEnv);
    console.log('✅ Basic .env created');
  }
} else {
  console.log('✅ .env file already exists');
}

// Create uploads directory if it doesn't exist
const uploadsPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('📁 Created uploads directory');
} else {
  console.log('✅ Uploads directory already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Setup database
console.log('\n🏗️  Setting up database...');
try {
  execSync('node scripts/setup.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Database setup complete');
} catch (error) {
  console.error('❌ Database setup failed.');
  console.error('');
  console.error('🔧 Common solutions:');
  console.error('   1. Install MySQL/MariaDB: https://dev.mysql.com/downloads/mysql/');
  console.error('   2. Start MySQL service: sudo systemctl start mysql (Linux/Mac)');
  console.error('   3. Update .env with correct database credentials');
  console.error('   4. Run: npm run setup (to retry)');
  console.error('');
  console.error('💡 Default .env settings assume:');
  console.error('   - MySQL running on localhost');
  console.error('   - Root user with no password');
  console.error('   - Database: bachelor_society');
  process.exit(1);
}

// Start the server
console.log('\n🎉 Starting Bachelor Society server...');
console.log('📱 App will be available at: http://localhost:3007');
console.log('🔐 Register your first account to get started!\n');

try {
  // Use execSync with detached option to run in background
  const serverProcess = execSync('npm start', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    detached: true
  });
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
}
