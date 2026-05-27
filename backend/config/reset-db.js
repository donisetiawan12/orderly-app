/**
 * Script untuk drop dan recreate database
 */
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
});

const dbName = process.env.DB_NAME || 'orderly_db';

connection.connect((err) => {
    if (err) {
        console.error('❌ Connection error:', err.message);
        process.exit(1);
    }

    // Drop database
    connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``, (err) => {
        if (err) {
            console.error('❌ Drop error:', err.message);
            connection.end();
            process.exit(1);
        }
        console.log(`✅ Database \`${dbName}\` berhasil dihapus`);
        connection.end();
        process.exit(0);
    });
});
