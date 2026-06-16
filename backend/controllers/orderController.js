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

// =========================================================================
// 🛒 AMBIL DATA PESANAN BUYER + JOIN DETAIL REKENING + JOIN DATA REVIEWS (FIXED)
// =========================================================================
exports.getMyOrders = async (req, res) => {
    try {
        const buyer_id = req.user.id; 

        // 🔥 QUERY SUPER: Sekarang kita join juga ke tabel reviews berdasarkan order_id
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

        // Eksekusi query ke database MySQL lu bray
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

// 🔥 FUNGSI UPDATE CATATAN (NOTES) PESANAN BUYER SEBELUM DI-BAYAR
exports.updateOrderNotes = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { notes } = req.body;
        const buyer_id = req.user.id; // Keamanan agar buyer gak ngedit pesanan orang lain

        // 1. Cek dulu apakah orderan ini valid milik si buyer dan statusnya masih 'pending'
        const [orderCheck] = await db.execute(
            'SELECT * FROM orders WHERE id = ? AND buyer_id = ?',
            [orderId, buyer_id]
        );

        if (orderCheck.length === 0) {
            return sendResponse(res, 404, "error", "Data pesanan lu kaga ketemu bray!");
        }

        if (orderCheck[0].status !== 'pending') {
            return sendResponse(res, 400, "error", "Gak bisa diubah bray, pesanan udah diproses seller!");
        }

        // 2. Lakukan update pada kolom notes di database
        const sqlUpdateNotes = `UPDATE orders SET notes = ?, updated_at = NOW() WHERE id = ?`;
        await db.execute(sqlUpdateNotes, [notes, orderId]);

        return sendResponse(res, 200, "success", "Catatan pesanan berhasil diperbarui bray!");

    } catch (error) {
        console.error("Error pas update catatan bray:", error);
        return sendResponse(res, 500, "error", "Gagal memperbarui catatan di server.");
    }
};

// Tambahkan fungsi ini di orderController.js (VERSI REVISI SUPER AKURAT)
exports.uploadPaymentProof = async (req, res) => {
    try {
        const { id } = req.params; // ID Order

        // 🔥 FIX UTAMA: Ambil req.file.filename (NAMA FILENYA AJA BRAY, BIAR GAK DOUBLE FOLDER)
        const payment_proof = req.file ? req.file.filename : null;

        if (!payment_proof) {
            return sendResponse(res, 400, "error", "Bukti pembayaran wajib diupload!");
        }

        // Update database: set nama file foto dan ubah status jadi 'paid'
        const sql = `UPDATE orders SET payment_proof = ?, status = 'paid' WHERE id = ?`;
        const [result] = await db.execute(sql, [payment_proof, id]);

        if (result.affectedRows === 0) {
            return sendResponse(res, 404, "error", "Order tidak ditemukan!");
        }

        // Kita return data nama filenya buat frontend kalau butuh bray
        sendResponse(res, 200, "success", "Bukti pembayaran berhasil diupload!", { payment_proof });
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

// =========================================================================
// ⭐️ TAMBAH REVIEW PRODUK SETELAH COMPLETED (MYSQL EXECUTE)
// =========================================================================
exports.addReview = async (req, res) => {
    try {
        const { order_id, rating, comment } = req.body;
        const buyer_id = req.user.id; // ID buyer dari token login

        // 1. Validasi: Cek apakah orderan ini beneran milik si buyer dan statusnya udah 'completed'
        const [orderCheck] = await db.execute(
            "SELECT product_id, seller_id, status FROM orders WHERE id = ? AND buyer_id = ?", 
            [order_id, buyer_id]
        );

        if (orderCheck.length === 0) {
            return res.status(404).json({ status: "error", message: "Data pesanan kaga ketemu bray!" });
        }

        const { product_id, seller_id, status } = orderCheck[0];

        if (status !== 'completed') {
            return res.status(400).json({ 
                status: "error", 
                message: "Gak bisa kasih review bray, pesanan lu belum berstatus selesai (completed)!" 
            });
        }

        // 2. Validasi input rating (misal wajib 1 - 5)
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ status: "error", message: "Rating wajib diisi antara 1 sampai 5 bray!" });
        }

        // 3. Eksekusi INSERT ke tabel reviews milik lu bray
        const sqlInsertReview = `
            INSERT INTO reviews (order_id, buyer_id, seller_id, product_id, rating, comment, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        
        await db.execute(sqlInsertReview, [
            order_id, 
            buyer_id, 
            seller_id, 
            product_id, 
            rating, 
            comment || null // Kalau gak isi komen, set jadi NULL sesuai struktur tabel lu
        ]);

        return res.status(201).json({
            status: "success",
            message: "🎉 Terima kasih bray! Ulasan produk berhasil disimpan."
        });

    } catch (error) {
        console.error("🔥 ERROR PAS ADD REVIEW:", error.message);
        // Handle jika buyer mencoba duplikat review (jika order_id di-set UNIQUE di database)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ status: "error", message: "Lu udah pernah ngasih ulasan buat pesanan ini bray!" });
        }
        return res.status(500).json({ status: "error", message: "Gagal mengirim ulasan di server backend." });
    }
};
// Tambahin ini di paling bawah file orderController.js bray!
// =========================================================================
// 🛑 PROSES PEMBATALAN MANDIRI OLEH BUYER (FIXED & AKURAT)
// =========================================================================
exports.cancelMyOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const buyerId = req.user.id; // Ambil ID dari verifyToken

        // 1. Cek dulu apakah pesanan ini beneran ada, milik si buyer, dan statusnya masih 'pending'
        const [orderCheck] = await db.execute(
            "SELECT product_id, quantity, status FROM orders WHERE id = ? AND buyer_id = ?",
            [orderId, buyerId]
        );

        if (orderCheck.length === 0) {
            return sendResponse(res, 404, "error", "Data pesanan lu kaga ketemu bray!");
        }

        const { product_id, quantity, status } = orderCheck[0];

        if (status !== 'pending') {
            return sendResponse(res, 400, "error", "Gak bisa dibatalkan bray, pesanan lu udah diproses seller!");
        }

        // 2. Eksekusi UPDATE status pesanan jadi 'cancelled'
        const [updateResult] = await db.execute(
            "UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = ? AND buyer_id = ?",
            [orderId, buyerId]
        );

        if (updateResult.affectedRows === 0) {
            return sendResponse(res, 400, "error", "Gagal memperbarui status pembatalan.");
        }

        // 3. 🔥 LOGIKA KUOTA: Balikin angka sold_quantity produk biar slot PO-nya kebuka lagi
        const sqlRestoreProductSold = `
            UPDATE products 
            SET sold_quantity = GREATEST(0, sold_quantity - ?) 
            WHERE id = ?
        `;
        await db.execute(sqlRestoreProductSold, [quantity, product_id]);

        // 4. Kirim respon sukses pake helper bawaan lu
        return sendResponse(res, 200, "success", "🛑 Pre-order lu berhasil dibatalkan bray! Kuota produk dikembalikan.");

    } catch (error) {
        console.error("🔥 ERROR PAS BUYER CANCEL ORDER:", error.message);
        return sendResponse(res, 500, "error", "Terjadi kesalahan sistem pada server backend bray!: " + error.message);
    }
};