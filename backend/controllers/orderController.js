const db = require('../config/db');

// Helper respon standar
const sendResponse = (res, statusCode, status, message, data = null) => {
    res.status(statusCode).json({ status, message, data });
};

exports.createOrder = async (req, res) => {
    console.log("==========================================");
    console.log("🚀 API CHECKOUT LAGI DITEMBAK BUYER!");
    console.log("Data yang masuk dari Frontend:", req.body);
    console.log("==========================================");


    try {
        // 1. Ambil data yang dikirim oleh buyer dari frontend
        const { product_id, seller_id, quantity, total_price, payment_method, notes } = req.body;
        const buyer_id = req.user.id; // Mengambil id buyer dari token middleware auth lu

        // 2. Query utama: Masukkan data pesanan baru ke tabel orders
        const sqlInsertOrder = `
            INSERT INTO orders (buyer_id, product_id, seller_id, quantity, total_price, status, payment_method, notes) 
            VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
        `;
        
        // PENTING: Gunakan db.query atau db.execute sesuai settingan awal project lu
        const [orderResult] = await db.query(sqlInsertOrder, [
            buyer_id, 
            product_id, 
            seller_id, 
            quantity, 
            total_price, 
            payment_method, 
            notes
        ]);

        // 3. QUERY SAKTI: Paksa database untuk menambah sold_quantity produk tersebut!
        // Ini yang bakal nembak langsung kolom 'sold_quantity' yang tadinya 0 di DB lu
        const sqlUpdateProductSold = `
            UPDATE products 
            SET sold_quantity = sold_quantity + ? 
            WHERE id = ?
        `;
        await db.query(sqlUpdateProductSold, [quantity, product_id]);

        // 4. Kirim respon sukses ke frontend buyer
        res.status(201).json({
            status: "success",
            message: "🛒 Pesanan berhasil dibuat, kuota PO otomatis berkurang!",
            orderId: orderResult.insertId
        });

    } catch (err) {
        console.error("🔥 ERROR PAS BUYER CHECKOUT:", err.message);
        res.status(500).json({ message: 'Gagal memproses pesanan: ' + err.message });
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

        // 2. Ambil total pendapatan (order yang sudah PAID, CONFIRMED, SHIPPED, atau COMPLETED)
        const [totalRevenue] = await db.execute(
            "SELECT SUM(total_price) as revenue FROM orders WHERE seller_id = ? AND status IN ('paid', 'confirmed', 'shipped', 'completed')", 
            [seller_id]
        );

        // 3. Ambil total produk aktif milik seller
        const [totalProducts] = await db.execute(
            "SELECT COUNT(*) as total FROM products WHERE seller_id = ?",
            [seller_id]
        );

        // 4. Ambil jumlah pelanggan unik
        const [totalCustomers] = await db.execute(
            "SELECT COUNT(DISTINCT buyer_id) as total FROM orders WHERE seller_id = ?",
            [seller_id]
        );

        // 5. [BARU] Ambil SEMUA data order khusus untuk grafik tahun ini (Tanpa LIMIT 5)
        // Kolom created_at ditarik agar bisa dihitung naik-turunnya oleh frontend secara akurat
        const [chartOrders] = await db.execute(
            `SELECT total_price, quantity, created_at 
             FROM orders 
             WHERE seller_id = ? AND status IN ('paid', 'confirmed', 'shipped', 'completed')`,
            [seller_id]
        );

        // 6. Ambil daftar 5 order terbaru untuk list tabel (Tetap pakai LIMIT 5 agar rapi)
        const [recentOrders] = await db.execute(
            `SELECT o.id, o.status, o.total_price, o.quantity, o.payment_proof, o.notes, 
                    u.name as buyer_name, p.name as product_name, o.created_at
            FROM orders o 
            JOIN users u ON o.buyer_id = u.id 
            JOIN products p ON o.product_id = p.id
            WHERE o.seller_id = ? 
            ORDER BY o.created_at DESC LIMIT 5`,
            [seller_id]
        );

        // Kirim data gabungan ke frontend
        sendResponse(res, 200, "success", "Data statistik berhasil dimuat", {
            total_order: totalOrder[0].total,
            total_revenue: totalRevenue[0].revenue || 0,
            total_products: totalProducts[0].total || 0,     
            total_customers: totalCustomers[0].total || 0,   
            recent_orders: recentOrders,
            chart_orders: chartOrders // 🔍 Kita selipkan data utuh grafik di sini, bro!
        });
    } catch (error) {
        console.error("❌ Detail Error Database:", error);
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