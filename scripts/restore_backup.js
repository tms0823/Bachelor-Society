const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function restoreBackup() {
  const backupPath = path.join(__dirname, '..', 'database_backup.json');

  console.log('🔄 Starting database restore...');

  try {
    // Check if backup exists
    if (!fs.existsSync(backupPath)) {
      console.error('❌ No backup file found!');
      console.error(`   Expected: ${backupPath}`);
      console.error('   Run: npm run db:backup first');
      process.exit(1);
    }

    // Load backup
    console.log('📖 Loading backup file...');
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    console.log(`📅 Backup from: ${backup.timestamp}`);
    console.log('📊 Records to restore:');

    Object.entries(backup.data).forEach(([table, records]) => {
      console.log(`   ${table}: ${records.length} records`);
    });

    // Confirmation prompt
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    await new Promise(resolve => {
      rl.question('\n⚠️  This will OVERWRITE existing data. Continue? (yes/no): ', (answer) => {
        if (answer.toLowerCase() !== 'yes') {
          console.log('❌ Restore cancelled.');
          process.exit(0);
        }
        rl.close();
        resolve();
      });
    });

    // Clear existing data (except seed users)
    console.log('\n🧹 Clearing existing data...');
    await clearExistingData();

    // Restore data in correct order (respecting foreign keys)
    console.log('📥 Restoring data...');

    const restoreOrder = [
      'users',
      'housing',
      'buddies',
      'roommate_requests',
      'messages',
      'notifications',
      'buddy_participants'
    ];

    for (const table of restoreOrder) {
      if (backup.data[table] && backup.data[table].length > 0) {
        console.log(`   Restoring ${table}...`);
        await restoreTable(table, backup.data[table]);
      }
    }

    console.log('\n🎉 Restore completed successfully!');
    console.log('✅ All user data has been restored.');

  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    process.exit(1);
  }
}

async function clearExistingData() {
  // Clear tables in reverse dependency order
  const tables = [
    'buddy_participants',
    'messages',
    'notifications',
    'roommate_requests',
    'buddies',
    'housing',
    'users'  // Keep seed users (IDs 1-7)
  ];

  for (const table of tables) {
    if (table === 'users') {
      // Only delete users with ID > 7 (preserve seed data)
      await new Promise((res, rej) => {
        db.query('DELETE FROM users WHERE id > 7', (err) => err ? rej(err) : res());
      });
    } else {
      await new Promise((res, rej) => {
        db.query(`DELETE FROM ${table}`, (err) => err ? rej(err) : res());
      });
    }
  }
}

async function restoreTable(tableName, records) {
  if (records.length === 0) return;

  for (const record of records) {
    // Remove auto-generated fields
    const cleanRecord = { ...record };
    delete cleanRecord.created_at; // Let DB set this

    const columns = Object.keys(cleanRecord);
    const values = Object.values(cleanRecord);
    const placeholders = columns.map(() => '?').join(', ');

    const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

    await new Promise((resolve, reject) => {
      db.query(sql, values, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

restoreBackup();
