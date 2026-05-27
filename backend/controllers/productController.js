const db = require('../config/db');

exports.createProduct = async (req, res) => {
    try {
        const { name, category_id, description, price, quantity, po_deadline } = req.body;
        const seller_id = req.user ? req.user.id : null; // Cek dulu
        const image = req.file ? req.file.path : null;

        // DEBUG: Cek apa yang nilainya undefined
        console.log("Data:", { seller_id, category_id, name, description, price, quantity, image, po_deadline });

        // Pakai null jika datanya tidak ada, jangan biarkan undefined
        const sql = `INSERT INTO products 
            (seller_id, category_id, name, description, price, quantity, image, po_deadline) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            
        const [result] = await db.execute(sql, [
            seller_id, 
            category_id || null, 
            name || null, 
            description || null, 
            price || null, 
            quantity || 0, 
            image, 
            po_deadline || null
        ]);

        res.status(201).json({ status: 201, message: "Produk berhasil dibuat!", productId: result.insertId });
    } catch (error) {
        console.error("Error Detail:", error); // Biar tau error SQL-nya
        res.status(500).json({ status: 500, message: error.message });
    }
};

// Update Produk
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, quantity, status } = req.body;
        const seller_id = req.user.id;

        // Cek apakah produk milik seller ini
        const [product] = await db.execute("SELECT * FROM products WHERE id = ? AND seller_id = ?", [id, seller_id]);
        if (product.length === 0) return res.status(404).json({ message: "Produk tidak ditemukan atau bukan milik Anda!" });

        const sql = `UPDATE products SET name=?, description=?, price=?, quantity=?, status=? WHERE id=?`;
        await db.execute(sql, [name, description, price, quantity, status, id]);

        res.json({ status: 200, message: "Produk berhasil diupdate!" });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

// Hapus Produk
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const seller_id = req.user.id;

        const [result] = await db.execute("DELETE FROM products WHERE id = ? AND seller_id = ?", [id, seller_id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Produk tidak ditemukan!" });

        res.json({ status: 200, message: "Produk berhasil dihapus!" });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    const [rows] = await db.execute("SELECT * FROM products WHERE status = 'active'");
    res.json({ status: 200, data: rows });
};