const mysql = require('mysql2');

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // The default username for XAMPP MySQL
  password: '',      // The default password for XAMPP MySQL (empty)
  database: 'bachelor_db'  // Your database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL database');
});

module.exports = db;
