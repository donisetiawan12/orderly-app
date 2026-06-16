const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer'); 
const path = require('path');
const fs = require('fs');

// ==========================================
// 🛠️ KONFIGURASI STORAGE UPLOAD (FIX: MASUK KE SUB-FOLDER CATEGORIES)
// ==========================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 🔥 JALUR KUNCI: Kita arahkan langsung masuk ke sub-folder categories bray!
        const dir = './uploads/categories';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true }); // Auto-create folder jika belum ada
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Nama file unik bawaan lu
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadKategori = multer({ storage: storage });

// ==========================================
// 🔥 FUNGSI GENERATE SLUG OTOMATIS
// ==========================================
const makeSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')         
        .replace(/[^\w\-]+/g, '')     
        .replace(/\-\-+/g, '-');       
};

// ==========================================
// 🟢 1. GET ALL CATEGORIES
// ==========================================
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY id ASC');
        res.json({
            status: "success",
            data: rows
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

// ==========================================
// ➕ 2. POST / ADD NEW CATEGORY
// ==========================================
router.post('/', uploadKategori.single('image'), async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ status: "error", message: 'Nama kategori wajib diisi bray! ⚠️' });
        }

        const slug = makeSlug(name);
        
        // 💡 KUNCINYA DI SINI: Di database cukup simpan nama filenya saja bray (req.file.filename),
        // sama persis seperti sistem gambar KTM seller dan file lama lu!
        const imagePath = req.file ? req.file.filename : null;

        const [result] = await db.query(
            'INSERT INTO categories (name, description, slug, image) VALUES (?, ?, ?, ?)',
            [name, description || '', slug, imagePath]
        );

        res.status(201).json({
            status: "success",
            message: 'Kategori berhasil dibuat bray! 📁',
            categoryId: result.insertId
        });
    } catch (err) {
        console.error('❌ Error POST:', err.message);
        res.status(500).json({ status: "error", message: err.message });
    }
});

// ==========================================
// ✏️ 3. PUT / UPDATE CATEGORY
// ==========================================
router.put('/:id', uploadKategori.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        
        if (!name || name.trim() === '') {
            return res.status(400).json({ status: "error", message: 'Nama kategori tidak boleh kosong bray! ⚠️' });
        }

        const slug = makeSlug(name);
        
        if (req.file) {
            // 🔥 Cukup simpan nama filenya saja
            const imagePath = req.file.filename;
            await db.query(
                'UPDATE categories SET name = ?, description = ?, slug = ?, image = ? WHERE id = ?',
                [name, description || '', slug, imagePath, id]
            );
        } else {
            await db.query(
                'UPDATE categories SET name = ?, description = ?, slug = ? WHERE id = ?',
                [name, description || '', slug, id]
            );
        }

        res.json({ status: "success", message: 'Kategori berhasil diperbarui bray! ✏️' });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

// ==========================================
// 🗑️ 4. DELETE / HAPUS CATEGORY
// ==========================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ status: "success", message: 'Kategori berhasil dihapus secara permanen! 🗑️' });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

module.exports = router;