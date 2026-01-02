const fs = require('fs');
const path = require('path');
const db = require('../config/db');

function runSqlFile(filePath) {
  return new Promise((resolve, reject) => {
    const sql = fs.readFileSync(filePath, 'utf8');

    // Remove comments and split by semicolon
    const cleanedSql = sql
      .replace(/--.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .trim();

    // Split by semicolon but be careful with semicolons inside strings
    const statements = [];
    let currentStatement = '';
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < cleanedSql.length; i++) {
      const char = cleanedSql[i];

      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && cleanedSql[i - 1] !== '\\') {
        inString = false;
      } else if (!inString && char === ';') {
        currentStatement = currentStatement.trim();
        if (currentStatement) {
          statements.push(currentStatement);
          currentStatement = '';
        }
        continue;
      }

      currentStatement += char;
    }

    // Add any remaining statement
    currentStatement = currentStatement.trim();
    if (currentStatement) {
      statements.push(currentStatement);
    }

    (async () => {
      try {
        for (const stmt of statements) {
          if (stmt.trim()) {
            await new Promise((res, rej) => db.query(stmt, (err) => err ? rej(err) : res()));
          }
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    })();
  });
}

async function checkForExistingData() {
  try {
    // Check if users table exists and has data
    const userResult = await new Promise((res, rej) =>
      db.query('SELECT COUNT(*) as count FROM users WHERE id > 7', (err, results) => err ? rej(err) : res(results))
    );

    const realUsers = userResult[0].count;

    if (realUsers > 0) {
      console.error('❌ SAFETY: Existing user data detected!');
      console.error(`   Found ${realUsers} registered users (IDs > 7)`);
      console.error('');
      console.error('   This command is for FRESH INSTALLS only.');
      console.error('   To reset existing data, use: npm run db:reset-safe');
      console.error('');
      console.error('   Or backup first: npm run db:backup');
      process.exit(1);
    }

    console.log('✅ No existing user data found. Safe to proceed with fresh install.');
  } catch (err) {
    // Table doesn't exist yet, which is fine for fresh install
    console.log('✅ Database appears to be empty. Safe to proceed with fresh install.');
  }
}

async function main() {
  try {
    console.log('🆕 Starting FRESH DATABASE INSTALL...');
    console.log('   This command is for brand new setups only.');
    console.log('');

    // SAFETY CHECK: Ensure no existing user data
    await checkForExistingData();

    // Confirm this is intentional
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    await new Promise(resolve => {
      rl.question('Continue with fresh database install? (yes/no): ', (answer) => {
        if (answer.toLowerCase() !== 'yes') {
          console.log('❌ Fresh install cancelled.');
          process.exit(0);
        }
        rl.close();
        resolve();
      });
    });

    // Check if tables already exist (skip if this is a re-run)
    let tablesExist = false;
    try {
      await new Promise((res, rej) => db.query('SELECT 1 FROM users LIMIT 1', (err) => {
        if (!err) tablesExist = true;
        res();
      }));
    } catch (e) {
      // Tables don't exist, continue
    }

    if (tablesExist) {
      console.log('📋 Tables already exist. This appears to be a re-run.');
      console.log('   Skipping schema creation...');
    } else {
      // Create tables in dependency order
      console.log('📐 Creating database schema...');

      // Users table
      console.log('   Creating users table...');
      await new Promise((res, rej) => db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          email VARCHAR(255) UNIQUE,
          phone VARCHAR(50) UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'user',
          name VARCHAR(255),
          age INT,
          gender VARCHAR(50),
          occupation VARCHAR(255),
          preferred_location VARCHAR(255),
          budget_min INT,
          budget_max INT,
          interests TEXT,
          profile_picture VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => err ? rej(err) : res()));

      // Housing table
      console.log('   Creating housing table...');
      await new Promise((res, rej) => db.query(`
        CREATE TABLE IF NOT EXISTS housing (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          address VARCHAR(500) NOT NULL,
          area VARCHAR(255) NOT NULL,
          rent DECIMAL(10,2) NOT NULL,
          available_from DATE,
          rooms INT,
          property_type ENUM('apartment', 'house', 'room', 'studio') DEFAULT 'apartment',
          gender_preference ENUM('male', 'female', 'any') DEFAULT 'any',
          lease_duration_months INT DEFAULT 12,
          allowed_residents ENUM('students', 'working', 'families', 'anyone') DEFAULT 'anyone',
          smoking_allowed BOOLEAN DEFAULT TRUE,
          pets_allowed BOOLEAN DEFAULT TRUE,
          religion_preference VARCHAR(100),
          university_preference VARCHAR(255),
          max_occupants INT,
          photos JSON,
          is_private BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `, (err) => err ? rej(err) : res()));

      // Buddies table
      console.log('   Creating buddies table...');
      await new Promise((res, rej) => db.query(`
        CREATE TABLE IF NOT EXISTS buddies (
          id INT AUTO_INCREMENT PRIMARY KEY,
          owner_id INT,
          activity_type VARCHAR(100) NOT NULL,
          location VARCHAR(255) NOT NULL,
          date_time DATETIME NOT NULL,
          description TEXT,
          max_participants INT DEFAULT 10,
          gender_preference ENUM('male', 'female', 'any') DEFAULT 'any',
          min_age INT DEFAULT 18,
          max_age INT DEFAULT 99,
          cost_per_person DECIMAL(8,2) DEFAULT 0,
          photos JSON,
          is_private BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `, (err) => err ? rej(err) : res()));

      // Remaining tables
      console.log('   Creating remaining tables...');
      const remainingTables = [
        `CREATE TABLE IF NOT EXISTS buddy_participants (
          id INT AUTO_INCREMENT PRIMARY KEY,
          buddy_id INT NOT NULL,
          user_id INT NOT NULL,
          status ENUM('interested', 'joined', 'declined') DEFAULT 'interested',
          joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (buddy_id) REFERENCES buddies(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_buddy_user (buddy_id, user_id)
        )`,
        `CREATE TABLE IF NOT EXISTS roommate_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          owner_id INT,
          preferred_location VARCHAR(255) NOT NULL,
          budget_min DECIMAL(10,2),
          budget_max DECIMAL(10,2),
          lifestyle TEXT,
          move_in_date DATE,
          description TEXT,
          gender_preference ENUM('male', 'female', 'any') DEFAULT 'any',
          room_type ENUM('private_room', 'shared_room', 'any') DEFAULT 'any',
          lease_duration_preference INT DEFAULT 12,
          occupation VARCHAR(100),
          smoking_preference ENUM('non_smoker', 'occasional', 'regular', 'any') DEFAULT 'any',
          religion VARCHAR(100),
          pet_preference ENUM('no_pets', 'cats_ok', 'dogs_ok', 'any_pets') DEFAULT 'any_pets',
          max_roommates INT DEFAULT 1,
          photos JSON,
          is_private BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
        )`,
        `CREATE TABLE IF NOT EXISTS messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          sender_id INT NOT NULL,
          receiver_id INT NOT NULL,
          subject VARCHAR(255),
          message TEXT NOT NULL,
          related_type VARCHAR(50),
          related_id INT,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT,
          related_id INT,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
      ];

      for (const stmt of remainingTables) {
        await new Promise((res, rej) => db.query(stmt, (err) => err ? rej(err) : res()));
      }

      console.log('✅ Schema created');
    }

    // Always insert seed data (safe to re-run)
    console.log('🌱 Inserting seed data...');
    await runSqlFile(path.join(__dirname, '..', 'sql', 'seed.sql'));
    console.log('✅ Seed data inserted');

    console.log('');
    console.log('🎉 Fresh database install completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Create admin account: node scripts/create-admin.js');
    console.log('2. Start server: npm start');

  } catch (err) {
    console.error('❌ Fresh install failed:', err);
    process.exit(1);
  }
}

main();
