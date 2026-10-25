const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool to MySQL database
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hostel_mess_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
});

// Test connection function
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL database:', process.env.DB_NAME || 'hostel_mess_db');
        connection.release();
        return true;
    } catch (err) {
        console.error('❌ MySQL connection error:', err.message);
        return false;
    }
}

module.exports = {
    pool,
    query: (sql, params) => pool.execute(sql, params),
    testConnection
};
