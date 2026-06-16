const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool;

// Jika berjalan di Railway dan mendeteksi DATABASE_URL string panjang
if (process.env.DATABASE_URL) {
    console.log('🔄 Menghubungkan ke Aiven MySQL via DATABASE_URL...');
    pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // 🔥 WAJIB: Bypass validasi SSL untuk MySQL Aiven Cloud
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
} else {
    // Jika berjalan di localhost laptop kamu (bawaan asli kamu)
    console.log('🔄 Menghubungkan ke MySQL Lokal...');
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'orderly_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

// Test koneksi saat server pertama kali dinyalakan (bawaan asli kamu)
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