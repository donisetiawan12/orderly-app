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

// Definisi Middleware
const uploadKTM = multer({ 
    storage: storageKTM,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) return cb(null, true);
        cb(new Error('Hanya file gambar atau PDF yang diperbolehkan!'));
    }
}).single('ktm_file');

const uploadProduct = multer({ storage: storageProduct }).single('image');

// EKSPOR SEKALI SAJA
module.exports = { uploadKTM, uploadProduct };