const db = require('../config/db');

// Helper untuk format respon standar bawaan lu bray
const sendResponse = (res, statusCode, status, message, data = null) => {
    return res.status(statusCode).json({ status, message, data });
};

// 1. CREATE PRODUCT
exports.createProduct = async (req, res) => {
    try {
        const { name, category_id, description, price, quantity, po_quota, po_deadline, location } = req.body;
        const seller_id = req.user.id; 
        const image = req.file ? req.file.filename : null;

        if (!name || !price) {
            return sendResponse(res, 400, "error", "Nama dan Harga produk wajib diisi");
        }

        const sql = `INSERT INTO products 
            (seller_id, category_id, name, description, price, quantity, po_quota, po_deadline, location, image, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`;
        
        const [result] = await db.execute(sql, [
            seller_id, 
            category_id || null, 
            name, 
            description || null, 
            price, 
            quantity || 0, 
            po_quota || 0, 
            po_deadline || null, 
            location || 'Kampus A', 
            image
        ]);

        sendResponse(res, 201, "success", "🚀 Produk baru berhasil dimasukkan ke database!", { productId: result.insertId });
    } catch (error) {
        console.error("Create Product Error:", error);
        sendResponse(res, 500, "error", "Gagal menambahkan produk: " + error.message);
    }
};

// 2. UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, quantity, status, po_quota, po_deadline, location, category_id } = req.body;
        const seller_id = req.user.id;

        const [product] = await db.execute("SELECT id FROM products WHERE id = ? AND seller_id = ?", [id, seller_id]);
        if (product.length === 0) return sendResponse(res, 403, "error", "Aksi ditolak! Ini bukan produk milik Anda.");

        let sql = `UPDATE products SET name=?, description=?, price=?, quantity=?, status=?, po_quota=?, po_deadline=?, location=?, category_id=?`;
        let params = [name, description || null, price, quantity || 0, status || 'active', po_quota || 0, po_deadline || null, location || 'Kampus A', category_id || null];

        if (req.file) {
            sql += `, image=?`;
            params.push(req.file.filename);
        }

        sql += ` WHERE id=? AND seller_id=?`;
        params.push(id, seller_id);
            
        await db.execute(sql, params);
        sendResponse(res, 200, "success", "✨ Data produk berhasil diperbarui!");
    } catch (error) {
        console.error("Update Product Error:", error);
        sendResponse(res, 500, "error", "Gagal mengupdate produk: " + error.message);
    }
};

// 3. DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const seller_id = req.user.id;

        const [result] = await db.execute("DELETE FROM products WHERE id = ? AND seller_id = ?", [id, seller_id]);
        if (result.affectedRows === 0) return sendResponse(res, 403, "error", "Aksi ditolak! Anda dilarang menghapus produk milik toko lain.");

        sendResponse(res, 200, "success", "🗑️ Produk berhasil dihapus dari sistem!");
    } catch (error) {
        console.error("Delete Product Error:", error);
        sendResponse(res, 500, "error", "Gagal menghapus produk");
    }
};

// 4. GET ALL PRODUCTS (SUPPORT SELLER LOCK & LANDING PAGE DENGAN AVG RATING)

exports.getAllProducts = async (req, res) => {
    try {
        const sellerId = req.user ? req.user.id : null; 

        let sql = `
            SELECT 
                p.*, 
                u.name AS seller_name,
                COALESCE(AVG(r.rating), 0) AS avg_rating, 
                COUNT(r.id) AS total_reviews
            FROM products p
            JOIN users u ON p.seller_id = u.id
            LEFT JOIN reviews r ON p.id = r.product_id
        `;
        
        let params = [];
        if (sellerId) {
            sql += ` WHERE p.seller_id = ?`;
            params.push(sellerId);
        }
        
        // 🚀 DIUBAH DI SINI: ganti p.id DESC menjadi p.id ASC
        sql += ` GROUP BY p.id ORDER BY p.id ASC`;

        const [products] = await db.execute(sql, params);
        
        return res.status(200).json({
            status: "success",
            data: { products }
        });
    } catch (error) {
        console.error("Get Products Error:", error);
        sendResponse(res, 500, "error", "Gagal memuat data produk");
    }
};

// 5. GET SELLER REVIEWS (DIUPDATE BIAR NGE-FETCH BALASAN SELLER JUGA BRAY)
exports.getSellerReviews = async (req, res) => {
    try {
        const { seller_id } = req.params;
        const sql = `
            SELECT 
                r.id AS review_id, r.rating, r.comment, r.reply_comment, r.replied_at, r.created_at,
                p.name AS product_name, p.image AS product_image, u.name AS buyer_name
            FROM reviews r
            JOIN products p ON r.product_id = p.id
            JOIN users u ON r.buyer_id = u.id
            WHERE p.seller_id = ? 
            ORDER BY r.created_at DESC
        `;
        const [reviews] = await db.execute(sql, [seller_id]);
        sendResponse(res, 200, "success", "Data ulasan berhasil dimuat bray", reviews);
    } catch (error) {
        console.error("Get Seller Reviews Error:", error);
        sendResponse(res, 500, "error", "Gagal memuat ulasan produk");
    }
};

// 🚀 FUNGSI BARU: SELLER MEMBALAS ULASAN BUYER (TARUH DI PALING BAWAH FILE BRAY)
exports.replyReview = async (req, res) => {
    try {
        const { review_id } = req.params;
        const { reply_comment } = req.body;
        const seller_id = req.user.id; // Diambil aman lewat verifyToken middleware

        if (!reply_comment || reply_comment.trim() === "") {
            return sendResponse(res, 400, "error", "Isi pesan balasan tidak boleh kosong bray!");
        }

        // Validasi pengaman: Pastikan ulasan ini emang milik produk si seller yang sedang login
        const checkSql = `
            SELECT r.id FROM reviews r 
            JOIN products p ON r.product_id = p.id 
            WHERE r.id = ? AND p.seller_id = ?
        `;
        const [rows] = await db.execute(checkSql, [review_id, seller_id]);

        if (rows.length === 0) {
            return sendResponse(res, 403, "error", "Aksi ditolak! Ulasan ini bukan milik produk toko Anda.");
        }

        // Jalankan Query Update Balasan Ke Database
        const updateSql = `
            UPDATE reviews 
            SET reply_comment = ?, replied_at = NOW() 
            WHERE id = ?
        `;
        await db.execute(updateSql, [reply_comment, review_id]);

        sendResponse(res, 200, "success", "✍️ Balasan ulasan Anda berhasil disimpan!");
    } catch (error) {
        console.error("Reply Review Error:", error);
        sendResponse(res, 500, "error", "Gagal menyimpan balasan ulasan bray: " + error.message);
    }
};

// Ambil ulasan untuk satu produk (Spesifik Buyer) - FIX AMAN BRAY
exports.getProductReviews = async (req, res) => { // 🚀 FIX: Argumen cuma req dan res!
    const { id } = req.params;

    try {
        // 🚀 FIX: Menggunakan COALESCE atau AS untuk alias ID, bukan pakai kata 'OR'
        const query = `
            SELECT 
                r.id AS review_id, 
                r.rating, 
                r.comment, 
                r.reply_comment,   
                r.replied_at,      
                r.created_at, 
                u.name AS buyer_name 
            FROM reviews r
            JOIN users u ON r.buyer_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        `;

        // Jalankan query database
        const [reviews] = await db.execute(query, [id]); 

        // Return response dengan struktur json yang bener
        return res.status(200).json({
            status: 'success',
            data: reviews
        });

    } catch (error) {
        console.error("Error Get Product Reviews:", error);
        return res.status(500).json({ 
            status: 'error',
            message: "Gagal fetch ulasan bray: " + error.message 
        });
    }
};