const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hostel_mess_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Diagnostic test connection with safe error reporting (never logs passwords)
 */
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log(`✅ Connected to MySQL database: '${dbConfig.database}' on ${dbConfig.host}:${dbConfig.port} (User: ${dbConfig.user})`);
        connection.release();
        return true;
    } catch (err) {
        console.error('❌ MySQL Connection Failure Details:');
        console.error(`   - Target: ${dbConfig.host}:${dbConfig.port}`);
        console.error(`   - User: ${dbConfig.user}`);
        console.error(`   - Database: ${dbConfig.database}`);
        console.error(`   - Error Code: ${err.code || 'UNKNOWN'}`);

        if (err.code === 'ECONNREFUSED') {
            console.error(`   👉 Cause: Connection refused. MySQL server is not running on ${dbConfig.host}:${dbConfig.port}.`);
            console.error('   👉 Action: Please start your MySQL service (e.g., via XAMPP Control Panel, Services.msc, MySQL Workbench, or "net start mysql").');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error(`   👉 Cause: Database '${dbConfig.database}' does not exist.`);
            console.error(`   👉 Action: Run the schema in 'database/reviews.sql' after creating the database: CREATE DATABASE ${dbConfig.database};`);
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error(`   👉 Cause: Access denied for user '${dbConfig.user}'. Invalid password or insufficient privileges.`);
            console.error('   👉 Action: Verify DB_USER and DB_PASSWORD in your backend/.env file.');
        } else if (err.code === 'ENOTFOUND') {
            console.error(`   👉 Cause: Host '${dbConfig.host}' not found.`);
            console.error('   👉 Action: Check DB_HOST in your backend/.env file.');
        } else {
            console.error(`   👉 Cause: ${err.sqlMessage || err.message || 'Unknown database error'}`);
        }
        return false;
    }
}

module.exports = {
    pool,
    query: (sql, params) => pool.execute(sql, params),
    testConnection
};
