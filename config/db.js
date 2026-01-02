const mysql = require('mysql2');
const dotenv = require('dotenv');
// Load environment variables from the .env file
dotenv.config();
// Create the database connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed: ', err);
        return;
    }
    console.log('Connected to the MySQL database');
    connection.release();
});
module.exports = db;
