const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool dengan promise support
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'orderly_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test koneksi saat server pertama kali dinyalakan
pool.getConnection()
    .then(connection => {
        console.log('✅ Database MySQL Terkoneksi dengan Sukses!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Gagal Terkoneksi ke Database:', err.message);
        process.exit(1); // Exit jika database tidak terkoneksi
    });

module.exports = pool;