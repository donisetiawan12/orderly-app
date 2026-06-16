const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============ MIDDLEWARE CORS (DINAMIS VERCEL & LOCALHOST) ============
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', // Jaga-jaga kalau pake Vite lokal
];

app.use(cors({
    origin: function (origin, callback) {
        // 1. Mengizinkan request tanpa origin (seperti Postman)
        if (!origin) return callback(null, true);
        
        // 2. Mengizinkan jika origin ada di daftar lokal ATAU berakhiran .vercel.app
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        } else {
            return callback(new Error('Akses diblokir oleh kebijakan CORS bray!'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve folder uploads agar gambar QRIS/produk bisa diakses dari browser/frontend bray
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============ REGISTER APPS ROUTES ============
// Taruh rute ping di paling atas buat cek apakah backend nyala polos
app.get('/', (req, res) => {
    return res.status(200).json({ message: "Server orderly-app aktif!", status: "OK" });
});

app.get('/ping', (req, res) => {
    return res.status(200).json({ message: "pong", timestamp: new Date().toISOString() });
});

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes'); 
const paymentRoutes = require('./routes/payments'); 

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes); 

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
    res.status(404).json({ message: 'Route tidak ditemukan di server backend bray' });
});

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log(`✅ Server berjalan di port ${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});