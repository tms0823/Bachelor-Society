const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🔄 Starting SAFE DATABASE RESET...');
  console.log('   This command requires a backup and explicit confirmation.');
  console.log('');

  try {
    // Check for existing user data
    const db = require('../config/db');
    let realUsers = 0;

    try {
      const userResult = await new Promise((res, rej) =>
        db.query('SELECT COUNT(*) as count FROM users WHERE id > 7', (err, results) => err ? rej(err) : res(results))
      );
      realUsers = userResult[0].count;
    } catch (err) {
      console.log('✅ No existing database found. Use: npm run db:fresh-install');
      process.exit(0);
    }

    if (realUsers === 0) {
      console.log('✅ No user data found. Use: npm run db:fresh-install');
      process.exit(0);
    }

    console.log(`⚠️  Found ${realUsers} registered users with posts that will be DELETED!`);
    console.log('');

    // REQUIRE BACKUP EXISTS
    const backupPath = path.join(__dirname, '..', 'database_backup.json');
    if (!fs.existsSync(backupPath)) {
      console.error('❌ SAFETY VIOLATION: No backup found!');
      console.error(`   Expected backup file: ${backupPath}`);
      console.error('');
      console.error('   Create backup first:');
      console.error('   npm run db:backup');
      console.error('');
      console.error('   This prevents accidental data loss.');
      process.exit(1);
    }

    // Show backup info
    console.log('✅ Backup found. Loading backup details...');
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    console.log(`   📅 Backup created: ${backup.timestamp}`);
    console.log('   📊 Backup contains:');

    Object.entries(backup.data).forEach(([table, records]) => {
      if (records.length > 0) {
        console.log(`      ${table}: ${records.length} records`);
      }
    });

    console.log('');

    // REQUIRE EXPLICIT CONFIRMATION
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('⚠️  DANGER ZONE - DATA DESTRUCTION AHEAD ⚠️');
    console.log('');
    console.log('This will:');
    console.log('1. DELETE all user accounts (except admin)');
    console.log('2. DELETE all housing listings');
    console.log('3. DELETE all buddy activities');
    console.log('4. DELETE all roommate requests');
    console.log('5. DELETE all messages and notifications');
    console.log('6. Restore from backup');
    console.log('');

    // First confirmation
    await new Promise(resolve => {
      rl.question('Do you understand this will DELETE ALL USER DATA? (type "I UNDERSTAND"): ', (answer) => {
        if (answer !== 'I UNDERSTAND') {
          console.log('❌ Reset cancelled - you did not type the exact phrase.');
          process.exit(0);
        }
        resolve();
      });
    });

    // Second confirmation
    await new Promise(resolve => {
      rl.question('Are you ABSOLUTELY SURE you want to proceed? (type "YES DESTROY ALL DATA"): ', (answer) => {
        if (answer !== 'YES DESTROY ALL DATA') {
          console.log('❌ Reset cancelled - you did not type the exact phrase.');
          process.exit(0);
        }
        rl.close();
        resolve();
      });
    });

    console.log('');
    console.log('🗑️  Starting data destruction and restore...');

    // Run the restore script
    require('./restore_backup.js');

  } catch (error) {
    console.error('❌ Safe reset failed:', error.message);
    process.exit(1);
  }
}

main();
