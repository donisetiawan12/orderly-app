const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============ MIDDLEWARE ============
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ STATIC FILES ============
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============ ROUTES ============
app.get('/ping', (req, res) => {
    return res.status(200).json({ message: "pong", timestamp: new Date().toISOString() });
});

// Daftarkan Routes di sini
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes'); // <--- PASTIKAN FILE INI ADA

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // <--- INI YG KURANG

// ============ ERROR HANDLING MIDDLEWARE ============
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        status: err.status || 500
    });
});

// ============ 404 HANDLER ============
app.use((req, res) => {
    res.status(404).json({ message: 'Route tidak ditemukan' });
});

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log(`✅ Server berjalan di http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});