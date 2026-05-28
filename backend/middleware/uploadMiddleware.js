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
    destination: './uploads/payments/', // Pastikan folder ini ada di direktori lu!
    filename: (req, file, cb) => {
        cb(null, `pay-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Middleware KTM
const uploadKTM = multer({ 
    storage: storageKTM,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) return cb(null, true);
        cb(new Error('Hanya file gambar atau PDF yang diperbolehkan!'));
    }
}).single('ktm_file');

// Middleware Produk
const uploadProduct = multer({ storage: storageProduct }).single('image');

// Middleware Bukti Bayar
const uploadPayment = multer({ 
    storage: storagePayment,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/; // Bukti bayar fokus ke gambar
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) return cb(null, true);
        cb(new Error('Hanya file gambar (jpg/png) yang diperbolehkan untuk bukti bayar!'));
    }
}).single('payment_proof'); // Nama field di Postman nanti harus "payment_proof"

module.exports = { uploadKTM, uploadProduct, uploadPayment };