const db = require('../config/db');

// Helper respon standar
const sendResponse = (res, statusCode, status, message, data = null) => {
    res.status(statusCode).json({ status, message, data });
};

// =========================================================================
// 🛒 1. API CHECKOUT GABUNGAN (VERSI LOCK WAKTU - TANPA TAMBAH KOLOM)
// =========================================================================
exports.createOrder = async (req, res) => {
    console.log("==========================================");
    console.log("🚀 API CHECKOUT TANPA TAMBAH KOLOM AKTIF!");
    console.log("==========================================");

    try {
        const { total_price, notes, items, payment_method } = req.body;
        const buyer_id = req.user.id; 

        if (!items || items.length === 0) {
            return res.status(400).json({ status: "error", message: "Gagal: Keranjang belanja kosong bray!" });
        }

        // 🔥 KUNCI UTAMA: Ambil 1 waktu saat ini, biar semua item punya waktu 'created_at' yang sama persis!
        const commonTimestamp = new Date();

        for (const item of items) {
            const { product_id, quantity, price } = item;

            const [productData] = await db.query(
                "SELECT seller_id FROM products WHERE id = ?", 
                [product_id]
            );

            if (productData.length === 0) {
                return res.status(404).json({ status: "error", message: `Produk dengan ID ${product_id} tidak ditemukan bray!` });
            }

            const seller_id = productData[0].seller_id;
            const item_total_price = Number(price) * Number(quantity);

            // Paksa masukin NOW() manual pake variabel commonTimestamp bray
            const sqlInsertOrder = `
                INSERT INTO orders (buyer_id, product_id, seller_id, quantity, total_price, status, payment_method, notes, created_at) 
                VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)
            `;
            
            await db.query(sqlInsertOrder, [
                buyer_id, 
                product_id, 
                seller_id, 
                quantity, 
                item_total_price, 
                payment_method || 'Transfer Bank', 
                notes,
                commonTimestamp // Dikunci di jam, menit, detik yang sama
            ]);

            const sqlUpdateProductSold = `UPDATE products SET sold_quantity = sold_quantity + ? WHERE id = ?`;
            await db.query(sqlUpdateProductSold, [quantity, product_id]);
        }

        await db.query("DELETE FROM cart WHERE user_id = ?", [buyer_id]);

        res.status(201).json({
            status: "success",
            message: "🛒 Semua pesanan sukses dicheckout barengan bray!"
        });

    } catch (err) {
        console.error("🔥 ERROR PAS BUYER CHECKOUT:", err.message);
        res.status(500).json({ message: 'Gagal memproses pesanan: ' + err.message });
    }
};

// =========================================================================
// 🛒 2. AMBIL DATA PESANAN BUYER
// =========================================================================
exports.getMyOrders = async (req, res) => {
    try {
        const buyer_id = req.user.id; 

        const sql = `
          SELECT o.*, p.name as product_name, 
                 sp.bank_name as seller_bank_name, 
                 sp.account_name as seller_account_name, 
                 sp.account_number as seller_account_number, 
                 sp.qris_image as seller_qris_image,
                 r.rating as review_rating,
                 r.comment as review_comment,
                 r.created_at as review_created_at
          FROM orders o
          JOIN products p ON o.product_id = p.id
          LEFT JOIN seller_payments sp ON o.seller_id = sp.user_id
          LEFT JOIN reviews r ON o.id = r.order_id
          WHERE o.buyer_id = ?
          ORDER BY o.created_at DESC
        `;

        const [rows] = await db.execute(sql, [buyer_id]);

        return res.status(200).json({
            status: "success",
            data: rows
        });

    } catch (error) {
        console.error("Error pas fetch order bray:", error);
        return res.status(500).json({ status: "error", message: "Gagal ambil data" });
    }
};

// =========================================================================
// 📸 3. UPLOAD BUKTI BAYAR - SEKALI UPLOAD, BAYAR SEMUA YANG BARENGAN!
// =========================================================================
exports.uploadPaymentProof = async (req, res) => {
    try {
        const { id } = req.params; 
        const payment_proof = req.file ? req.file.filename : null;

        if (!payment_proof) {
            return sendResponse(res, 400, "error", "Bukti pembayaran wajib diupload!");
        }

        // 1. Cari tahu kapan created_at pesanan ini bray
        const [orderData] = await db.execute("SELECT buyer_id, created_at FROM orders WHERE id = ?", [id]);
        
        if (orderData.length === 0) {
            return sendResponse(res, 404, "error", "Order tidak ditemukan!");
        }

        const { buyer_id, created_at } = orderData[0];

        // 2. 🔥 TRICK SAKTI: Update status 'paid' untuk semua order yang buyer_id dan created_at nya sama persis!
        const sql = `UPDATE orders SET payment_proof = ?, status = 'paid' WHERE buyer_id = ? AND created_at = ?`;
        await db.execute(sql, [payment_proof, buyer_id, created_at]);

        sendResponse(res, 200, "success", "Bukti pembayaran berhasil diupload untuk seluruh nota ini bray!", { payment_proof });
    } catch (error) {
        console.error("Upload Payment Error:", error);
        sendResponse(res, 500, "error", "Gagal mengupload bukti pembayaran");
    }
};

// --- SISANYA TETEP SAMA KAYA CODINGAN LU BRAY ---

exports.updateOrderNotes = async (req, res) => {
    try {
        const orderId = req.params.id; const { notes } = req.body; const buyer_id = req.user.id;
        const [orderCheck] = await db.execute('SELECT * FROM orders WHERE id = ? AND buyer_id = ?', [orderId, buyer_id]);
        if (orderCheck.length === 0) return sendResponse(res, 404, "error", "Data pesanan lu kaga ketemu bray!");
        if (orderCheck[0].status !== 'pending') return sendResponse(res, 400, "error", "Gak bisa diubah bray!");
        await db.execute(`UPDATE orders SET notes = ?, updated_at = NOW() WHERE id = ?`, [notes, orderId]);
        return sendResponse(res, 200, "success", "Catatan pesanan berhasil diperbarui bray!");
    } catch (error) { return sendResponse(res, 500, "error", "Gagal"); }
};

exports.getSellerStats = async (req, res) => {
    try {
        const seller_id = req.user.id;
        const [totalOrder] = await db.execute("SELECT COUNT(*) as total FROM orders WHERE seller_id = ?", [seller_id]);
        const [totalRevenue] = await db.execute("SELECT SUM(total_price) as revenue FROM orders WHERE seller_id = ? AND status IN ('paid', 'confirmed', 'shipped', 'completed')", [seller_id]);
        const [totalProducts] = await db.execute("SELECT COUNT(*) as total FROM products WHERE seller_id = ?", [seller_id]);
        const [totalCustomers] = await db.execute("SELECT COUNT(DISTINCT buyer_id) as total FROM orders WHERE seller_id = ?", [seller_id]);
        const [chartOrders] = await db.execute(`SELECT total_price, quantity, status, buyer_id, created_at FROM orders WHERE seller_id = ?`, [seller_id]);
        const [recentOrders] = await db.execute(`SELECT o.id, o.status, o.total_price, o.quantity, o.payment_proof, o.notes, u.name as buyer_name, p.name as product_name, o.created_at FROM orders o JOIN users u ON o.buyer_id = u.id JOIN products p ON o.product_id = p.id WHERE o.seller_id = ? ORDER BY o.created_at DESC LIMIT 50`, [seller_id]);
        sendResponse(res, 200, "success", "Data statistik berhasil", { total_order: totalOrder[0].total || 0, total_revenue: totalRevenue[0].revenue || 0, total_products: totalProducts[0].total || 0, total_customers: totalCustomers[0].total || 0, recent_orders: recentOrders, chart_orders: chartOrders });
    } catch (error) { sendResponse(res, 500, "error", "Gagal"); }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params; const { status } = req.body; const seller_id = req.user.id;
        const [currentOrder] = await db.execute("SELECT product_id, quantity, status FROM orders WHERE id = ? AND seller_id = ?", [id, seller_id]);
        if (currentOrder.length === 0) return sendResponse(res, 404, "error", "Order tidak ditemukan!");
        const { product_id, quantity, status: oldStatus } = currentOrder[0];
        await db.execute("UPDATE orders SET status = ? WHERE id = ? AND seller_id = ?", [status, id, seller_id]);
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            await db.execute(`UPDATE products SET sold_quantity = GREATEST(0, sold_quantity - ?) WHERE id = ?`, [quantity, product_id]);
        }
        sendResponse(res, 200, "success", "Status berhasil diupdate");
    } catch (error) { sendResponse(res, 500, "error", "Gagal"); }
};

exports.addReview = async (req, res) => {
    try {
        const { order_id, rating, comment } = req.body; const buyer_id = req.user.id;
        const [orderCheck] = await db.execute("SELECT product_id, seller_id, status FROM orders WHERE id = ? AND buyer_id = ?", [order_id, buyer_id]);
        if (orderCheck.length === 0) return res.status(404).json({ status: "error", message: "Gagal bray" });
        const { product_id, seller_id, status } = orderCheck[0];
        if (status !== 'completed') return res.status(400).json({ status: "error", message: "Belum completed" });
        await db.execute(`INSERT INTO reviews (order_id, buyer_id, seller_id, product_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`, [order_id, buyer_id, seller_id, product_id, rating, comment || null]);
        return res.status(201).json({ status: "success", message: "Review berhasil disimpan" });
    } catch (error) { return res.status(500).json({ status: "error", message: "Gagal" }); }
};

exports.cancelMyOrder = async (req, res) => {
    try {
        const orderId = req.params.id; const buyerId = req.user.id;
        const [orderCheck] = await db.execute("SELECT product_id, quantity, status FROM orders WHERE id = ? AND buyer_id = ?", [orderId, buyerId]);
        if (orderCheck.length === 0) return sendResponse(res, 404, "error", "Gak ketemu");
        const { product_id, quantity, status } = orderCheck[0];
        if (status !== 'pending') return sendResponse(res, 400, "error", "Gak bisa dibatalkan");
        await db.execute("UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = ? AND buyer_id = ?", [orderId, buyerId]);
        await db.execute(`UPDATE products SET sold_quantity = GREATEST(0, sold_quantity - ?) WHERE id = ?`, [quantity, product_id]);
        return sendResponse(res, 200, "success", "Pre-order berhasil dibatalkan");
    } catch (error) { return sendResponse(res, 500, "error", "Gagal"); }
};