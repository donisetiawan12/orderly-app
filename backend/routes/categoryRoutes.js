const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        // Menggunakan await karena sudah mode promise
        const [rows] = await db.query('SELECT * FROM categories');
        res.json({
            status: "success",
            data: rows
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

module.exports = router;