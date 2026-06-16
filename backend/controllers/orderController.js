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
        // 1. Ambil data utama dari req.body dan req.user
        const { total_price, notes, items, payment_method } = req.body;
        const buyer_id = req.user.id; 

        // Validasi jika array items kosong
        if (!items || items.length === 0) {
            return res.status(400).json({ status: "error", message: "Gagal: Keranjang belanja kosong bray!" });
        }

        // Jalankan looping untuk memasukkan semua item keranjang ke dalam tabel orders satu per satu
        for (const item of items) {
            const { product_id, quantity, price } = item;

            // 🔥 QUERY EXTRA: Cari siapa seller_id pemilik produk ini otomatis dari tabel products
            const [productData] = await db.query(
                "SELECT seller_id FROM products WHERE id = ?", 
                [product_id]
            );

            if (productData.length === 0) {
                return res.status(404).json({ status: "error", message: `Produk dengan ID ${product_id} tidak ditemukan bray!` });
            }

            const seller_id = productData[0].seller_id;
            const item_total_price = Number(price) * Number(quantity);

            // 2. Query utama: Masukkan data pesanan ke tabel orders
            const sqlInsertOrder = `
                INSERT INTO orders (buyer_id, product_id, seller_id, quantity, total_price, status, payment_method, notes) 
                VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
            `;
            
            await db.query(sqlInsertOrder, [
                buyer_id, 
                product_id, 
                seller_id, 
                quantity, 
                item_total_price, 
                payment_method || 'Transfer Bank', // fallback default jika payment_method kosong
                notes
            ]);

            // 3. QUERY SAKTI: Tambah sold_quantity produk tersebut!
            const sqlUpdateProductSold = `
                UPDATE products 
                SET sold_quantity = sold_quantity + ? 
                WHERE id = ?
            `;
            await db.query(sqlUpdateProductSold, [quantity, product_id]);
        }

        // 🔥 QUERY TAMBAHAN: Bersihkan isi keranjang (cart) milik user ini karena sudah sukses dicheckout bray!
        await db.query("DELETE FROM cart WHERE user_id = ?", [buyer_id]);

        // 4. Kirim respon sukses ke frontend buyer
        res.status(201).json({
            status: "success",
            message: "🛒 Pesanan berhasil dibuat, kuota PO otomatis berkurang dan keranjang dikosongkan!"
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

        // 5. 🔥 UTAMA: Ambil data order TANPA batasan status ketat agar data dummy/pending lu langsung kelihatan di grafik!
        // Kita gunakan DATE_FORMAT atau biarkan JavaScript frontend yang mengonversi tanggalnya
        const [chartOrders] = await db.execute(
            `SELECT total_price, quantity, status, buyer_id, created_at 
             FROM orders 
             WHERE seller_id = ?`,
            [seller_id]
        );

        // 6. Ambil data order terbaru untuk tabel list pesanan
        const [recentOrders] = await db.execute(
            `SELECT o.id, o.status, o.total_price, o.quantity, o.payment_proof, o.notes, 
                    u.name as buyer_name, p.name as product_name, o.created_at
            FROM orders o 
            JOIN users u ON o.buyer_id = u.id 
            JOIN products p ON o.product_id = p.id
            WHERE o.seller_id = ? 
            ORDER BY o.created_at DESC LIMIT 50`,
            [seller_id]
        );

        // Kirim data gabungan ke frontend
        sendResponse(res, 200, "success", "Data statistik berhasil dimuat", {
            total_order: totalOrder[0].total || 0,
            total_revenue: totalRevenue[0].revenue || 0,
            total_products: totalProducts[0].total || 0,     
            total_customers: totalCustomers[0].total || 0,   
            recent_orders: recentOrders,
            chart_orders: chartOrders 
        });
    } catch (error) {
        console.error("❌ Detail Error Database:", error);
        sendResponse(res, 500, "error", "Gagal memuat statistik");
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'confirmed', 'shipped', 'completed', atau 'cancelled'
        const seller_id = req.user.id;

        // 🔥 1. Izinkan status 'cancelled' masuk ke whitelist backend
        const validStatuses = ['confirmed', 'shipped', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return sendResponse(res, 400, "error", "Status tidak valid bray!");
        }

        // 2. Ambil data order dulu untuk tahu jumlah barang & id produknya (buat balikin stok)
        const [currentOrder] = await db.execute(
            "SELECT product_id, quantity, status FROM orders WHERE id = ? AND seller_id = ?",
            [id, seller_id]
        );

        if (currentOrder.length === 0) {
            return sendResponse(res, 404, "error", "Order tidak ditemukan!");
        }
        
        const { product_id, quantity, status: oldStatus } = currentOrder[0];

        // 3. Update status order menjadi status baru di database
        const [result] = await db.execute(
            "UPDATE orders SET status = ? WHERE id = ? AND seller_id = ?", 
            [status, id, seller_id]
        );

        if (result.affectedRows === 0) {
            return sendResponse(res, 400, "error", "Gagal memperbarui status pesanan.");
        }

        // 🔥 4. LOGIKA ANTI-JAIL (FIXED): Jika status berubah jadi 'cancelled', balikin kuota/stok produknya!
        // Menggunakan db.execute agar sinkron dengan koneksi utama database lu
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            const sqlRestoreProductSold = `
                UPDATE products 
                SET sold_quantity = GREATEST(0, sold_quantity - ?) 
                WHERE id = ?
            `;
            await db.execute(sqlRestoreProductSold, [quantity, product_id]);
        }

        const msgText = status === 'cancelled' 
            ? "Pesanan berhasil ditolak & dibatalkan permanen. Stok produk dikembalikan!" 
            : `Status pesanan diupdate menjadi ${status.toUpperCase()}`;

        sendResponse(res, 200, "success", msgText);
    } catch (error) {
        console.error("❌ Update Status Error:", error);
        sendResponse(res, 500, "error", "Gagal update status pesanan");
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