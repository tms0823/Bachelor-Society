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

async function main() {
  try {
    // CRITICAL: Backup existing users before dropping tables
    console.log('Checking for existing user data...');
    let existingUsers = [];

    try {
      const usersResult = await new Promise((res, rej) =>
        db.query('SELECT * FROM users WHERE id > 7', (err, results) => err ? rej(err) : res(results))
      );
      existingUsers = usersResult || [];
      console.log(`Found ${existingUsers.length} registered users (IDs > 7) to preserve`);
    } catch (err) {
      console.log('No existing users table found or no registered users - this appears to be a fresh install');
    }

    // First drop existing tables in reverse dependency order
    console.log('Dropping existing tables...');

    // Disable foreign key checks temporarily
    await new Promise((res, rej) => db.query('SET FOREIGN_KEY_CHECKS = 0', (err) => err ? rej(err) : res()));

    const dropTables = [
      'DROP TABLE IF EXISTS messages',
      'DROP TABLE IF EXISTS notifications',
      'DROP TABLE IF EXISTS roommate_requests',
      'DROP TABLE IF EXISTS buddy_participants',
      'DROP TABLE IF EXISTS buddies',
      'DROP TABLE IF EXISTS housing',
      'DROP TABLE IF EXISTS users'
    ];

    for (const stmt of dropTables) {
      await new Promise((res, rej) => db.query(stmt, (err) => err ? rej(err) : res()));
    }

    // Re-enable foreign key checks
    await new Promise((res, rej) => db.query('SET FOREIGN_KEY_CHECKS = 1', (err) => err ? rej(err) : res()));

    console.log('Tables dropped');

    // Create tables in dependency order
    console.log('Creating users table...');
    await new Promise((res, rej) => db.query(`
      CREATE TABLE users (
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

    console.log('Creating housing table...');
    await new Promise((res, rej) => db.query(`
      CREATE TABLE housing (
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

    console.log('Creating buddies table...');
    await new Promise((res, rej) => db.query(`
      CREATE TABLE buddies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT,
        activity_type VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        address VARCHAR(500),
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

    console.log('Creating remaining tables...');
    const remainingTables = [
      `CREATE TABLE buddy_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        buddy_id INT NOT NULL,
        user_id INT NOT NULL,
        status ENUM('interested', 'joined', 'declined') DEFAULT 'interested',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (buddy_id) REFERENCES buddies(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_buddy_user (buddy_id, user_id)
      )`,



      `CREATE TABLE roommate_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT,
        preferred_location VARCHAR(255) NOT NULL,
        address VARCHAR(500),
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
      `CREATE TABLE messages (
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
      )`
    ];

    for (const stmt of remainingTables) {
      await new Promise((res, rej) => db.query(stmt, (err) => err ? rej(err) : res()));
    }

    console.log('Schema applied');

    console.log('Running seed.sql');
    await runSqlFile(path.join(__dirname, '..', 'sql', 'seed.sql'));
    console.log('Seed data inserted');

    // CRITICAL: Restore backed up users after seed data
    if (existingUsers.length > 0) {
      console.log(`Restoring ${existingUsers.length} registered users...`);

      // Insert users one by one, handling potential conflicts
      for (const user of existingUsers) {
        try {
          // Use INSERT IGNORE to skip if user already exists (from seed data)
          await new Promise((res, rej) => {
            const insertSql = `
              INSERT INTO users (
                id, username, email, phone, password_hash, role, name, age, gender,
                occupation, preferred_location, budget_min, budget_max, interests,
                profile_picture, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                username = VALUES(username),
                email = VALUES(email),
                phone = VALUES(phone),
                password_hash = VALUES(password_hash),
                role = VALUES(role),
                name = VALUES(name),
                age = VALUES(age),
                gender = VALUES(gender),
                occupation = VALUES(occupation),
                preferred_location = VALUES(preferred_location),
                budget_min = VALUES(budget_min),
                budget_max = VALUES(budget_max),
                interests = VALUES(interests),
                profile_picture = VALUES(profile_picture)
            `;

            db.query(insertSql, [
              user.id, user.username, user.email, user.phone, user.password_hash,
              user.role, user.name, user.age, user.gender, user.occupation,
              user.preferred_location, user.budget_min, user.budget_max,
              user.interests, user.profile_picture, user.created_at
            ], (err) => err ? rej(err) : res());
          });
        } catch (err) {
          console.warn(`Failed to restore user ${user.username} (ID: ${user.id}):`, err.message);
        }
      }

      console.log(`Successfully restored ${existingUsers.length} registered users`);
    }

    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error('Error running SQL:', err);
    process.exit(1);
  }
}

main();
