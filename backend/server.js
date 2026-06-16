const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============ IMPORT ROUTES ============
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes'); // <--- Nanti kita buat file ini jika belum ada
const paymentRoutes = require('./routes/payments'); // 🚀 IMPOR ROUTE PAYMENT UTAMA

// ============ MIDDLEWARE ============
app.use(cors({
    // Izinkan localhost dan 127.0.0.1 sekaligus biar Macbook lu gak pusing bray!
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve folder uploads agar gambar QRIS/produk bisa diakses dari browser/frontend bray
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// ============ REGISTER APPS ROUTES ============
app.get('/ping', (req, res) => {
    return res.status(200).json({ message: "pong", timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes); // 🚀 JALUR UTAMA PEMBAYARAN SUDAH AKTIF

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