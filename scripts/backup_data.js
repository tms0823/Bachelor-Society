const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function backupData() {
  console.log('🔄 Starting database backup...');

  try {
    // Tables to backup (excluding seed data where possible)
    const tables = [
      { name: 'users', where: 'id > 7' }, // Skip seed users
      { name: 'housing', where: null },
      { name: 'buddies', where: null },
      { name: 'roommate_requests', where: null },
      { name: 'messages', where: null },
      { name: 'notifications', where: null },
      { name: 'buddy_participants', where: null }
    ];

    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {}
    };

    for (const table of tables) {
      console.log(`📦 Backing up ${table.name}...`);

      const query = table.where
        ? `SELECT * FROM ${table.name} WHERE ${table.where}`
        : `SELECT * FROM ${table.name}`;

      const results = await new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      backup.data[table.name] = results;
      console.log(`   ✅ ${results.length} records`);
    }

    // Save backup file
    const backupPath = path.join(__dirname, '..', 'database_backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

    console.log(`\n🎉 Backup completed successfully!`);
    console.log(`📁 Backup saved to: ${backupPath}`);
    console.log(`📊 Summary:`);

    Object.entries(backup.data).forEach(([table, records]) => {
      console.log(`   ${table}: ${records.length} records`);
    });

  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

backupData();
