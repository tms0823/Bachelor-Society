const db = require('../config/db');

console.log('Clearing all roommate data...');

db.query('DELETE FROM roommate_requests', (err, result) => {
  if (err) {
    console.error('Error deleting roommate data:', err);
    process.exit(1);
  }

  console.log(`✅ Successfully deleted ${result.affectedRows} roommate records`);
  console.log('Roommate table is now empty and ready for fresh data!');

  // Close database connection
  db.end();
  process.exit(0);
});
