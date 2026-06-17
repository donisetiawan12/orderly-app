const db = require('../config/db');

// Helper respon standar
const sendResponse = (res, statusCode, status, message, data = null) => {
    res.status(statusCode).json({ status, message, data });
};

// =========================================================================
// 🛒 1. API CHECKOUT GABUNGAN (VERSI LOCK WAKTU - FIX AKURAT)
// =========================================================================
exports.createOrder = async (req, res) => {
    console.log("==========================================");
    console.log("🚀 API CHECKOUT TANPA TAMBAH KOLOM AKTIF!");
    console.log("==========================================");

    try {
        const { notes, items, payment_method } = req.body;
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

            // Masukin data order baru dengan timestamp yang dikunci sama persis
            const sqlInsertOrder = `
                INSERT INTO orders (buyer_id, product_id, seller_id, quantity, total_price, status, payment_method, notes, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
            `;
            
            await db.query(sqlInsertOrder, [
                buyer_id, 
                product_id, 
                seller_id, 
                quantity, 
                item_total_price, 
                payment_method || 'Transfer Bank', 
                notes || 'Pre-order via web',
                commonTimestamp, // created_at dikunci
                commonTimestamp  // updated_at dikunci
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
// 🛒 2. AMBIL DATA PESANAN BUYER (FIX JOIN DATA SELLER DARI TABEL USERS)
// =========================================================================
exports.getMyOrders = async (req, res) => {
    try {
        const buyer_id = req.user.id; 

        // Kita JOIN ke seller_payments dengan trik subquery agar yang diambil HANYA data paling lengkap/terakhir dari seller tersebut bray!
        const sql = `
          SELECT 
            o.id, o.buyer_id, o.product_id, o.seller_id, o.quantity, o.total_price, 
            o.status, o.payment_method, o.payment_proof, o.notes, o.created_at,
            p.name as product_name, 
            MAX(sp.bank_name) as seller_bank_name, 
            MAX(sp.account_name) as seller_account_name, 
            MAX(sp.account_number) as seller_account_number, 
            MAX(sp.qris_image) as seller_qris_image,
            r.rating as review_rating,
            r.comment as review_comment
          FROM orders o
          JOIN products p ON o.product_id = p.id
          LEFT JOIN seller_payments sp ON o.seller_id = sp.user_id
          LEFT JOIN reviews r ON o.id = r.order_id
          WHERE o.buyer_id = ?
          GROUP BY o.id, o.buyer_id, o.product_id, o.seller_id, o.quantity, o.total_price, o.status, o.payment_method, o.payment_proof, o.notes, o.created_at, p.name, r.rating, r.comment
          ORDER BY o.created_at DESC
        `;

        const [rows] = await db.execute(sql, [buyer_id]);

        return res.status(200).json({
            status: "success",
            data: rows
        });

    } catch (error) {
        console.error("Error pas fetch order bray:", error);
        return res.status(500).json({ status: "error", message: "Gagal ambil data pesanan bray" });
    }
};

// =========================================================================
// 📸 3. UPLOAD BUKTI BAYAR - MASSAL SE-NOTA GABUNGAN
// =========================================================================
exports.uploadPaymentProof = async (req, res) => {
    try {
        const { id } = req.params; 
        const payment_proof = req.file ? req.file.filename : null;

        if (!payment_proof) {
            return sendResponse(res, 400, "error", "Bukti pembayaran wajib diupload!");
        }

        // 1. Cari tau kapan tanggal checkout pesanan perwakilan ini bray
        const [orderData] = await db.execute("SELECT buyer_id, created_at FROM orders WHERE id = ?", [id]);
        
        if (orderData.length === 0) {
            return sendResponse(res, 404, "error", "Order tidak ditemukan!");
        }

        const { buyer_id, created_at } = orderData[0];

        // 2. 🔥 UPDATE BARENGAN: Update status jadi 'paid' buat semua produk yang dibeli di waktu yang sama persis!
        const sql = `UPDATE orders SET payment_proof = ?, status = 'paid' WHERE buyer_id = ? AND created_at = ?`;
        await db.execute(sql, [payment_proof, buyer_id, created_at]);

        sendResponse(res, 200, "success", "🎉 Bukti pembayaran berhasil diupload untuk seluruh nota ini bray!", { payment_proof });
    } catch (error) {
        console.error("Upload Payment Error:", error);
        sendResponse(res, 500, "error", "Gagal mengupload bukti pembayaran");
    }
};

// =========================================================================
// 📌 4. UPDATE CATATAN PESANAN - MASSAL SE-NOTA SEBELUM BAYAR
// =========================================================================
exports.updateOrderNotes = async (req, res) => {
    try {
        const orderId = req.params.id; 
        const { notes } = req.body; 
        const buyer_id = req.user.id;

        const [orderCheck] = await db.execute('SELECT created_at, status FROM orders WHERE id = ? AND buyer_id = ?', [orderId, buyer_id]);
        if (orderCheck.length === 0) return sendResponse(res, 404, "error", "Data pesanan lu kaga ketemu bray!");
        if (orderCheck[0].status !== 'pending') return sendResponse(res, 400, "error", "Gak bisa diubah, pesanan sudah diproses bray!");

        // Update catatan untuk semua item dalam nota gabungan yang sama
        await db.execute(`UPDATE orders SET notes = ?, updated_at = NOW() WHERE buyer_id = ? AND created_at = ?`, [notes, buyer_id, orderCheck[0].created_at]);
        
        return sendResponse(res, 200, "success", "📌 Catatan seluruh nota berhasil diperbarui bray!");
    } catch (error) { 
        return sendResponse(res, 500, "error", "Gagal update catatan"); 
    }
};

// =========================================================================
// 🛑 5. BATALKAN PESANAN - MASSAL SE-NOTA GABUNGAN
// =========================================================================
exports.cancelMyOrder = async (req, res) => {
    try {
        const orderId = req.params.id; 
        const buyerId = req.user.id;

        // 1. Ambil info waktu pembuatan nota
        const [orderCheck] = await db.execute("SELECT created_at, status FROM orders WHERE id = ? AND buyer_id = ?", [orderId, buyerId]);
        if (orderCheck.length === 0) return sendResponse(res, 404, "error", "Pesanan tidak ditemukan bray!");
        if (orderCheck[0].status !== 'pending') return sendResponse(res, 400, "error", "Gak bisa dibatalkan karena sudah dibayar/diproses!");

        const targetTime = orderCheck[0].created_at;

        // 2. Ambil list semua item di dalam nota gabungan tersebut untuk balikin stok/sold_quantity
        const [allGroupedItems] = await db.execute("SELECT product_id, quantity FROM orders WHERE buyer_id = ? AND created_at = ?", [buyerId, targetTime]);

        // 3. Kurangi sold_quantity masing-masing produk
        for (const item of allGroupedItems) {
            await db.execute(`UPDATE products SET sold_quantity = GREATEST(0, sold_quantity - ?) WHERE id = ?`, [item.quantity, item.product_id]);
        }

        // 4. Update status 'cancelled' massal untuk satu nota gabungan
        await db.execute("UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE buyer_id = ? AND created_at = ?", [buyerId, targetTime]);

        return sendResponse(res, 200, "success", "🛑 Seluruh item di dalam nota ini berhasil dibatalkan bray!");
    } catch (error) { 
        console.error(error);
        return sendResponse(res, 500, "error", "Gagal membatalkan pesanan gabungan"); 
    }
};

// =========================================================================
// ⭐️ 6. TAMBAH ULASAN PRODUK INDIVIDU
// =========================================================================
exports.addReview = async (req, res) => {
    try {
        const { order_id, rating, comment } = req.body; 
        const buyer_id = req.user.id;

        const [orderCheck] = await db.execute("SELECT product_id, seller_id, status FROM orders WHERE id = ? AND buyer_id = ?", [order_id, buyer_id]);
        if (orderCheck.length === 0) return res.status(404).json({ status: "error", message: "Data pesanan kaga valid bray!" });
        
        const { product_id, seller_id, status } = orderCheck[0];
        if (status !== 'completed') return res.status(400).json({ status: "error", message: "Ulasan cuma bisa dikirim kalau menu sudah selesai dimasak/diantar bray!" });

        // Cek dulu apakah order ini sudah pernah direview biar ga duplikat key primary di database
        const [reviewCheck] = await db.execute("SELECT id FROM reviews WHERE order_id = ?", [order_id]);
        if (reviewCheck.length > 0) {
            return res.status(400).json({ status: "error", message: "Lu udah ngasih ulasan untuk menu yang ini bray!" });
        }

        await db.execute(`INSERT INTO reviews (order_id, buyer_id, seller_id, product_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`, [order_id, buyer_id, seller_id, product_id, rating, comment || null]);
        return res.status(201).json({ status: "success", message: "Review berhasil disimpan" });
    } catch (error) { 
        return res.status(500).json({ status: "error", message: "Gagal menyimpan ulasan" }); 
    }
};

// =========================================================================
// 📈 7. STATISTIK SELLER (TETAP AMAN)
// =========================================================================
exports.getSellerStats = async (req, res) => {
    try {
        const seller_id = req.user.id;
        const [totalOrder] = await db.execute("SELECT COUNT(*) as total FROM orders WHERE seller_id = ?", [seller_id]);
        const [totalRevenue] = await db.execute("SELECT SUM(total_price) as revenue FROM orders WHERE seller_id = ? AND status IN ('paid', 'confirmed', 'shipped', 'completed')", [seller_id]);
        const [totalProducts] = await db.execute("SELECT COUNT(*) as total FROM products WHERE seller_id = ?", [seller_id]);
        const [totalCustomers] = await db.execute("SELECT COUNT(DISTINCT buyer_id) as total FROM orders WHERE seller_id = ?", [seller_id]);
        const [chartOrders] = await db.execute(`SELECT total_price, quantity, status, buyer_id, created_at FROM orders WHERE seller_id = ?`, [seller_id]);
        const [recentOrders] = await db.execute(`SELECT o.id, o.status, o.total_price, o.quantity, o.payment_proof, o.notes, u.name as buyer_name, p.name as product_name, o.created_at FROM orders o JOIN users u ON o.buyer_id = u.id JOIN products p ON o.product_id = p.id WHERE o.seller_id = ? ORDER BY o.created_at DESC LIMIT 50`, [seller_id]);
        
        sendResponse(res, 200, "success", "Data statistik berhasil", { 
            total_order: totalOrder[0].total || 0, 
            total_revenue: totalRevenue[0].revenue || 0, 
            total_products: totalProducts[0].total || 0, 
            total_customers: totalCustomers[0].total || 0, 
            recent_orders: recentOrders, 
            chart_orders: chartOrders 
        });
    } catch (error) { 
        sendResponse(res, 500, "error", "Gagal mengambil statistik"); 
    }
};

// =========================================================================
// 🧑‍🍳 8. UPDATE STATUS PESANAN OLEH SELLER
// =========================================================================
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params; 
        const { status } = req.body; 
        const seller_id = req.user.id;
        
        const [currentOrder] = await db.execute("SELECT product_id, quantity, status FROM orders WHERE id = ? AND seller_id = ?", [id, seller_id]);
        if (currentOrder.length === 0) return sendResponse(res, 404, "error", "Order tidak ditemukan!");
        
        const { product_id, quantity, status: oldStatus } = currentOrder[0];
        await db.execute("UPDATE orders SET status = ? WHERE id = ? AND seller_id = ?", [status, id, seller_id]);
        
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            await db.execute(`UPDATE products SET sold_quantity = GREATEST(0, sold_quantity - ?) WHERE id = ?`, [quantity, product_id]);
        }
        sendResponse(res, 200, "success", "Status berhasil diupdate");
    } catch (error) { 
        sendResponse(res, 500, "error", "Gagal mengupdate status"); 
    }
};