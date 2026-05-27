const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
};

const dbName = process.env.DB_NAME || 'orderly_db';
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Split statements by semicolon
const statements = schemaContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

console.log(`📝 Ditemukan ${statements.length} SQL statements`);

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error('❌ Koneksi ke MySQL gagal:', err.message);
        process.exit(1);
    }
    console.log('✅ Terkoneksi ke MySQL Server');

    // Buat database
    connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``, (err) => {
        if (err) {
            console.error('❌ Gagal buat database:', err.message);
            connection.end();
            process.exit(1);
        }
        console.log(`✅ Database \`${dbName}\` siap`);

        // Switch ke database
        connection.query(`USE \`${dbName}\``, (err) => {
            if (err) {
                console.error('❌ Gagal switch database:', err.message);
                connection.end();
                process.exit(1);
            }
            console.log(`✅ Switched to database \`${dbName}\``);

            // Execute statements one by one
            let index = 0;
            const executeNextStatement = () => {
                if (index >= statements.length) {
                    console.log('✅ Semua SQL statements berhasil dijalankan!');
                    connection.end();
                    process.exit(0);
                    return;
                }

                const stmt = statements[index];
                connection.query(stmt, (err) => {
                    if (err) {
                        console.error(`❌ Error pada statement ${index + 1}:`, err.message);
                        connection.end();
                        process.exit(1);
                    }
                    console.log(`✅ Statement ${index + 1}/${statements.length} berhasil`);
                    index++;
                    executeNextStatement();
                });
            };

            executeNextStatement();
        });
    });
});

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error('❌ Koneksi ke MySQL gagal:', err.message);
        process.exit(1);
    }
    console.log('✅ Terkoneksi ke MySQL Server');

    // Buat database
    connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``, (err) => {
        if (err) {
            console.error('❌ Gagal buat database:', err.message);
            connection.end();
            process.exit(1);
        }
        console.log(`✅ Database \`${dbName}\` siap`);

        // Switch ke database
        connection.query(`USE \`${dbName}\``, (err) => {
            if (err) {
                console.error('❌ Gagal switch database:', err.message);
                connection.end();
                process.exit(1);
            }
            console.log(`✅ Switched to database \`${dbName}\``);

            // Execute statements one by one
            let index = 0;
            const executeNextStatement = () => {
                if (index >= statements.length) {
                    console.log('✅ Semua SQL statements berhasil dijalankan!');
                    connection.end();
                    process.exit(0);
                    return;
                }

                const stmt = statements[index];
                connection.query(stmt, (err) => {
                    if (err) {
                        console.error(`❌ Error pada statement ${index + 1}:`, err.message);
                        console.error(`Statement: ${stmt.substring(0, 100)}...`);
                        connection.end();
                        process.exit(1);
                    }
                    console.log(`✅ Statement ${index + 1}/${statements.length} berhasil`);
                    index++;
                    executeNextStatement();
                });
            };

            executeNextStatement();
        });
    });
});
