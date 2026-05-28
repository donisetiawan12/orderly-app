const db = require('../config/db');

// Helper respon standar
const sendResponse = (res, statusCode, status, message, data = null) => {
    res.status(statusCode).json({ status, message, data });
};

// Buat Pesanan Baru (Checkout)
exports.createOrder = async (req, res) => {
    try {
        const { product_id, seller_id, quantity, total_price, notes } = req.body;
        const buyer_id = req.user.id;

        // DEBUG: Cek apa yang masuk dari Postman
        console.log("Data diterima:", { buyer_id, product_id, seller_id, quantity, total_price, notes });

        // Validasi dasar
        if (!product_id || !seller_id || !quantity) {
            return res.status(400).json({ status: "error", message: "Data pesanan tidak lengkap!" });
        }

        // Cek stok produk
        const [product] = await db.execute("SELECT quantity FROM products WHERE id = ?", [product_id]);
        if (product.length === 0) return res.status(404).json({ status: "error", message: "Produk tidak ditemukan" });
        
        if (product[0].quantity < quantity) {
            return res.status(400).json({ status: "error", message: "Stok produk tidak mencukupi!" });
        }

        // INSERT dengan memastikan tidak ada 'undefined'
        const sql = `INSERT INTO orders (buyer_id, product_id, seller_id, quantity, total_price, notes) VALUES (?, ?, ?, ?, ?, ?)`;
        
        // Pakai || null untuk mencegah undefined
        await db.execute(sql, [
            buyer_id, 
            product_id, 
            seller_id, 
            quantity, 
            total_price || 0, 
            notes || null // Kalau notes kosong, kirim NULL ke database
        ]);

        // Kurangi stok
        await db.execute("UPDATE products SET quantity = quantity - ? WHERE id = ?", [quantity, product_id]);

        res.status(201).json({ status: "success", message: "Pesanan berhasil dibuat!" });
    } catch (error) {
        console.error("Order Error Detail:", error);
        res.status(500).json({ status: "error", message: "Gagal melakukan checkout" });
    }
};

// Lihat Riwayat Order (Buyer atau Seller)
exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        let sql = "";

        if (role === 'seller') {
            sql = "SELECT * FROM orders WHERE seller_id = ?";
        } else {
            sql = "SELECT * FROM orders WHERE buyer_id = ?";
        }

        const [orders] = await db.execute(sql, [userId]);
        sendResponse(res, 200, "success", "Data pesanan dimuat", orders);
    } catch (error) {
        console.error("Get Orders Error:", error);
        sendResponse(res, 500, "error", "Gagal memuat data pesanan");
    }
};

// Tambahkan fungsi ini di orderController.js
exports.uploadPaymentProof = async (req, res) => {
    try {
        const { id } = req.params; // ID Order
        const payment_proof = req.file ? req.file.path : null;

        if (!payment_proof) {
            return sendResponse(res, 400, "error", "Bukti pembayaran wajib diupload!");
        }

        // Update database: set path foto dan ubah status jadi 'paid'
        const sql = `UPDATE orders SET payment_proof = ?, status = 'paid' WHERE id = ?`;
        const [result] = await db.execute(sql, [payment_proof, id]);

        if (result.affectedRows === 0) {
            return sendResponse(res, 404, "error", "Order tidak ditemukan!");
        }

        sendResponse(res, 200, "success", "Bukti pembayaran berhasil diupload!");
    } catch (error) {
        console.error("Upload Payment Error:", error);
        sendResponse(res, 500, "error", "Gagal mengupload bukti pembayaran");
    }
};

exports.getSellerStats = async (req, res) => {
    try {
        const seller_id = req.user.id;

        // 1. Ambil jumlah order masuk
        const [totalOrder] = await db.execute(
            "SELECT COUNT(*) as total FROM orders WHERE seller_id = ?", 
            [seller_id]
        );

        // 2. Ambil total pendapatan (order yang sudah PAID saja)
        const [totalRevenue] = await db.execute(
            "SELECT SUM(total_price) as revenue FROM orders WHERE seller_id = ? AND status = 'paid'", 
            [seller_id]
        );

        // 3. Ambil daftar order terbaru
        const [recentOrders] = await db.execute(
            "SELECT o.*, u.username as buyer_name FROM orders o JOIN users u ON o.buyer_id = u.id WHERE o.seller_id = ? ORDER BY o.created_at DESC LIMIT 5",
            [seller_id]
        );

        sendResponse(res, 200, "success", "Data statistik berhasil dimuat", {
            total_order: totalOrder[0].total,
            total_revenue: totalRevenue[0].revenue || 0,
            recent_orders: recentOrders
        });
    } catch (error) {
        console.error("Stats Error:", error);
        sendResponse(res, 500, "error", "Gagal memuat statistik");
    }
};

// Seller Update Status (Confirmed -> Shipped -> Completed)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Status baru: 'confirmed', 'shipped', atau 'completed'
        const seller_id = req.user.id;

        // Validasi status
        const validStatuses = ['confirmed', 'shipped', 'completed'];
        if (!validStatuses.includes(status)) {
            return sendResponse(res, 400, "error", "Status tidak valid");
        }

        const [result] = await db.execute(
            "UPDATE orders SET status = ? WHERE id = ? AND seller_id = ?", 
            [status, id, seller_id]
        );

        if (result.affectedRows === 0) return sendResponse(res, 404, "error", "Order tidak ditemukan");

        sendResponse(res, 200, "success", `Status pesanan diupdate menjadi ${status}`);
    } catch (error) {
        sendResponse(res, 500, "error", "Gagal update status");
    }
};

exports.addReview = async (req, res) => {
    try {
        const { order_id, rating, comment } = req.body;
        const buyer_id = req.user.id;

        // 1. Ambil detail order untuk dapatkan product_id & seller_id
        const [orders] = await db.execute(
            "SELECT product_id, seller_id, status FROM orders WHERE id = ? AND buyer_id = ?", 
            [order_id, buyer_id]
        );

        if (orders.length === 0) return sendResponse(res, 404, "error", "Order tidak ditemukan!");
        if (orders[0].status !== 'completed') return sendResponse(res, 400, "error", "Ulasan hanya bisa dibuat untuk pesanan yang sudah selesai!");

        // 2. Simpan ulasan
        await db.execute(
            "INSERT INTO reviews (order_id, buyer_id, seller_id, product_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)",
            [order_id, buyer_id, orders[0].seller_id, orders[0].product_id, rating, comment]
        );

        sendResponse(res, 201, "success", "Ulasan berhasil dikirim!");
    } catch (error) {
        console.error("Add Review Error:", error);
        // Error code 1062 = Duplicate entry (sudah pernah direview)
        if (error.code === 'ER_DUP_ENTRY') {
            return sendResponse(res, 400, "error", "Anda sudah memberikan ulasan untuk pesanan ini!");
        }
        sendResponse(res, 500, "error", "Gagal mengirim ulasan");
    }
};