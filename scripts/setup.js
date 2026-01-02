const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create connection without specifying database to create it
const rootConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true
});

function runSqlFile(connection, filePath) {
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
            await new Promise((res, rej) => connection.query(stmt, (err) => err ? rej(err) : res()));
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
    console.log('🚀 Starting Bachelor Society database setup...');

    // Check required environment variables
    if (!process.env.DB_HOST || !process.env.DB_USER || process.env.DB_PASSWORD === undefined || !process.env.DB_NAME) {
      console.error('❌ Missing required environment variables:');
      console.error('   DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
      console.error('   Please check your .env file');
      process.exit(1);
    }

    console.log('🔌 Connecting to MySQL...');
    await new Promise((resolve, reject) => {
      rootConnection.connect((err) => {
        if (err) {
          console.error('❌ MySQL connection failed:', err.message);
          console.error('💡 Make sure MySQL is running and credentials are correct');
          reject(err);
        } else {
          console.log('✅ Connected to MySQL');
          resolve();
        }
      });
    });

    const dbName = process.env.DB_NAME;
    console.log(`🏗️  Creating database '${dbName}' if it doesn't exist...`);

    // Create database if it doesn't exist
    await new Promise((resolve, reject) => {
      rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``, (err) => {
        if (err) {
          console.error('❌ Failed to create database:', err.message);
          reject(err);
        } else {
          console.log(`✅ Database '${dbName}' ready`);
          resolve();
        }
      });
    });

    // Close root connection
    rootConnection.end();

    // Create new connection to the specific database
    const dbConnection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: dbName,
      multipleStatements: true
    });

    console.log('📋 Creating database tables...');
    await runSqlFile(dbConnection, path.join(__dirname, '..', 'sql', 'schema.sql'));
    console.log('✅ All tables created successfully');

    // Close database connection
    dbConnection.end();

    console.log('');
    console.log('🎉 Bachelor Society setup complete!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Run: npm start');
    console.log('   2. Open: http://localhost:3000');
    console.log('   3. Register your first account!');
    console.log('');
    console.log('💡 The database is now ready with empty tables.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Setup failed:', err);
    rootConnection.end();
    process.exit(1);
  }
}

main();
