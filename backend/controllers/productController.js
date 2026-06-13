const db = require('../config/db');

// Helper untuk format respon standar
const sendResponse = (res, statusCode, status, message, data = null) => {
    res.status(statusCode).json({ status, message, data });
};

exports.createProduct = async (req, res) => {
    try {
        // 🚀 AMBIL SEMUA DATA TERMASUK PO_QUOTA, PO_DEADLINE, DAN LOCATION
        const { name, category_id, description, price, quantity, po_quota, po_deadline, location } = req.body;
        const seller_id = req.user.id; 
        const image = req.file ? req.file.path : null;

        if (!name || !price) {
            return sendResponse(res, 400, "error", "Nama dan Harga produk wajib diisi");
        }

        // 🚀 QUERY INSERT LENGKAP MENCAKUP SEMUA KOLOM DB LU BRO
        const sql = `INSERT INTO products 
            (seller_id, category_id, name, description, price, quantity, po_quota, po_deadline, location, image) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const [result] = await db.execute(sql, [
            seller_id, 
            category_id || null, 
            name, 
            description || null, 
            price, 
            quantity || 0, 
            po_quota || 0, 
            po_deadline || null, 
            location || 'Kampus A', // Memastikan location terisi aman
            image
        ]);

        sendResponse(res, 201, "success", "Produk berhasil dibuat", { productId: result.insertId });
    } catch (error) {
        console.error("Create Product Error:", error);
        sendResponse(res, 500, "error", "Gagal menambahkan produk");
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // 🚀 AMBIL DATA LENGKAP SAAT UPDATE BIAR GAK ADA VARIABEL YANG TERLEWAT
        const { name, description, price, quantity, status, po_quota, po_deadline, location, category_id } = req.body;
        const seller_id = req.user.id;

        const [product] = await db.execute("SELECT id FROM products WHERE id = ? AND seller_id = ?", [id, seller_id]);
        if (product.length === 0) return sendResponse(res, 404, "error", "Produk tidak ditemukan atau bukan milik Anda");

        // 🚀 SINKRONISASI UPDATE UTK SEMUA KOLOM DI DATABASE LU TERMASUK PO DAN LOCATION
        const sql = `UPDATE products SET 
            name=?, 
            description=?, 
            price=?, 
            quantity=?, 
            status=?, 
            po_quota=?, 
            po_deadline=?, 
            location=?, 
            category_id=? 
            WHERE id=? AND seller_id=?`;
            
        await db.execute(sql, [
            name, 
            description || null, 
            price, 
            quantity || 0, 
            status || 'active', 
            po_quota || 0, 
            po_deadline || null, 
            location || 'Kampus A', // 🎴 Kunci utama nembus Kampus B ada di sini bro!
            category_id || null,
            id, 
            seller_id
        ]);

        sendResponse(res, 200, "success", "Produk berhasil diupdate");
    } catch (error) {
        console.error("Update Product Error:", error);
        sendResponse(res, 500, "error", "Gagal mengupdate produk");
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const seller_id = req.user.id;

        const [result] = await db.execute("DELETE FROM products WHERE id = ? AND seller_id = ?", [id, seller_id]);
        if (result.affectedRows === 0) return sendResponse(res, 404, "error", "Produk tidak ditemukan");

        sendResponse(res, 200, "success", "Produk berhasil dihapus");
    } catch (error) {
        console.error("Delete Product Error:", error);
        sendResponse(res, 500, "error", "Gagal menghapus produk");
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        let { search, category, page, limit, sortBy, order } = req.query;
        
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        const allowedSortFields = ['price', 'created_at', 'name'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
        const sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        let sql = "SELECT * FROM products WHERE 1=1";
        let params = [];

        if (search) {
            sql += " AND name LIKE ?";
            params.push(`%${search}%`);
        }

       if (category) {
            sql += " AND category_id = ?";
            params.push(category);
        }

        sql += ` ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [products] = await db.execute(sql, params);
        
        const [total] = await db.execute("SELECT COUNT(*) as count FROM products WHERE 1=1 " + (search ? "AND name LIKE ?" : ""), search ? [`%${search}%`] : []);
        
        sendResponse(res, 200, "success", "Data produk dimuat", {
            products,
            total_items: total[0].count,
            current_page: page,
            total_pages: Math.ceil(total[0].count / limit)
        });
    } catch (error) {
        console.error("Get Products Error:", error);
        sendResponse(res, 500, "error", "Gagal memuat produk");
    }
};

exports.getProductDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const [product] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);
        if (product.length === 0) return sendResponse(res, 404, "error", "Produk tidak ditemukan!");

        const [stats] = await db.execute(
            "SELECT AVG(rating) as avg_rating, COUNT(id) as total_reviews FROM reviews WHERE product_id = ?",
            [id]
        );

        const [reviews] = await db.execute(
            "SELECT r.rating, r.comment, r.created_at, u.name as username FROM reviews r JOIN users u ON r.buyer_id = u.id WHERE r.product_id = ?",
            [id]
        );

        sendResponse(res, 200, "success", "Detail photos dimuat", {
            product: product[0],
            rating: {
                average: parseFloat(stats[0].avg_rating || 0).toFixed(1),
                total_reviews: stats[0].total_reviews
            },
            reviews: reviews
        });
    } catch (error) {
        console.error("Detail Product Error:", error);
        sendResponse(res, 500, "error", "Gagal memuat detail produk");
    }
};

// =========================================================================
// 🚀 FITUR BARU: AMBIL SEMUA ULASAN PEMBELI KHUSUS UNTUK PRODUK MILIK SELLER
// =========================================================================
exports.getSellerReviews = async (req, res) => {
    try {
        const { seller_id } = req.params;

        // Query sakti JOIN 3 tabel menggunakan db.execute() async/await
        const sql = `
            SELECT 
                r.id AS review_id,
                r.rating,
                r.comment,
                r.created_at,
                p.name AS product_name,
                p.image AS product_image,
                u.name AS buyer_name
            FROM reviews r
            JOIN products p ON r.product_id = p.id
            JOIN users u ON r.buyer_id = u.id
            WHERE p.seller_id = ? 
            ORDER BY r.created_at DESC
        `;

        const [reviews] = await db.execute(sql, [seller_id]);

        sendResponse(res, 200, "success", "Data ulasan berhasil dimuat", reviews);
    } catch (error) {
        console.error("Get Seller Reviews Error:", error);
        sendResponse(res, 500, "error", "Gagal memuat ulasan produk");
    }
};