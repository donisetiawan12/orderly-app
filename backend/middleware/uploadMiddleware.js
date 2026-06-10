const multer = require('multer');
const path = require('path');

// Setup untuk KTM
const storageKTM = multer.diskStorage({
    destination: './uploads/ktm/',
    filename: (req, file, cb) => {
        cb(null, `ktm-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Setup untuk Produk
const storageProduct = multer.diskStorage({
    destination: './uploads/products/',
    filename: (req, file, cb) => {
        cb(null, `prod-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Setup untuk Bukti Bayar
const storagePayment = multer.diskStorage({
    destination: './uploads/payments/', 
    filename: (req, file, cb) => {
        cb(null, `pay-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Middleware KTM (SINKRON DENGAN FRONTEND NEXT.JS)
const uploadKTM = multer({ 
    storage: storageKTM,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) return cb(null, true);
        cb(new Error('Hanya file gambar atau PDF yang diperbolehkan!'));
    }
}).single('ktm'); // <--- DIUBAH DI SINI: Dari 'ktm_file' menjadi 'ktm'

// Middleware Produk
const uploadProduct = multer({ storage: storageProduct }).single('image');

// Middleware Bukti Bayar
const uploadPayment = multer({ 
    storage: storagePayment,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/; 
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) return cb(null, true);
        cb(new Error('Hanya file gambar (jpg/png) yang diperbolehkan untuk bukti bayar!'));
    }
}).single('payment_proof'); 

module.exports = { uploadKTM, uploadProduct, uploadPayment };