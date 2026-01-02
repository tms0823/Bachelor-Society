const db = require('../config/db');
const fs = require('fs');
const path = require('path');

console.log('Clearing all housing data and associated photo files...');

db.query('SELECT photos FROM housing WHERE photos IS NOT NULL', (err, results) => {
  if (err) {
    console.error('Error fetching housing photos:', err);
    process.exit(1);
  }

  // Delete photo files from filesystem
  let deletedFiles = 0;
  if (results && results.length > 0) {
    results.forEach(row => {
      if (row.photos) {
        try {
          let photos = row.photos;
          if (typeof photos === 'string') {
            photos = JSON.parse(photos);
          }

          if (Array.isArray(photos)) {
            photos.forEach(photo => {
              if (photo && photo.url) {
                const filename = photo.url.split('/').pop();
                const filePath = path.join('uploads', filename);
                try {
                  if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    deletedFiles++;
                  }
                } catch (fileErr) {
                  console.warn('Could not delete file:', filePath, fileErr.message);
                }
              }
            });
          }
        } catch (parseErr) {
          console.warn('Could not parse photos JSON:', parseErr.message);
        }
      }
    });
  }

  console.log(`Deleted ${deletedFiles} photo files from filesystem`);

  // Delete housing records from database
  db.query('DELETE FROM housing', (err2, result) => {
    if (err2) {
      console.error('Error deleting housing data:', err2);
      process.exit(1);
    }

    console.log(`✅ Successfully deleted ${result.affectedRows} housing records`);
    console.log('Housing table is now empty and ready for fresh data!');

    // Close database connection
    db.end();
    process.exit(0);
  });
});
