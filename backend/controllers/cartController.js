const db = require('../config/db'); // Sesuaikan path db lu
const { sendResponse } = require('../utils/response'); // Sesuaikan path helper response lu

// 1. Tambah Produk ke Keranjang
exports.addToCart = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const buyer_id = req.user.id;

        // 1. Ambil data po_quota dan sold_quantity asli dari DB saat ini
        const [productCheck] = await db.execute(
            'SELECT name, po_quota, sold_quantity FROM products WHERE id = ?', 
            [product_id]
        );

        if (productCheck.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Produk tidak ditemukan bray!' });
        }

        const product = productCheck[0];

        // 2. 🔥 VALIDASI SAKTI: Jika ini produk PO dan kuotanya sudah terpenuhi/habis
        if (Number(product.po_quota) > 0) {
            const sisaKuota = product.po_quota - (product.sold_quantity || 0);
            
            if (sisaKuota <= 0) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: `❌ Waduh bray, Kuota PO untuk ${product.name} sudah penuh! Gak bisa dipesan lagi.` 
                });
            }

            // Validasi tambahan: Kalau buyer maksa beli qty melebihi sisa kuota yang ada
            if (quantity > sisaKuota) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: `⚠️ Sisa kuota PO tinggal ${sisaKuota} Pcs bray, lu gak bisa borong sampai ${quantity} Pcs.` 
                });
            }
        }

        // 3. JIKA LOLOS VALIDASI, BARU JALANKAN PROSES MASUK KERANJANG SEPERTI BIASA...
        // (Lanjutkan kode query INSERT INTO cart lu di bawah sini bray)

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: 'Gagal memproses keranjang' });
    }
};

// 2. Ambil Semua Item Keranjang User
exports.getCartItems = async (req, res) => {
    try {
        const user_id = req.user.id;
        
        const [items] = await db.execute(`
            SELECT c.id as cart_id, c.quantity, p.id as product_id, p.name, p.price, p.image 
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ?`, 
            [user_id]
        );

        sendResponse(res, 200, "success", "Keranjang dimuat", items);
    } catch (error) {
        sendResponse(res, 500, "error", "Gagal memuat keranjang");
    }
};

// 3. Update Jumlah (Quantity) Item
exports.updateQuantity = async (req, res) => {
    try {
        const { id } = req.params; // Cart ID
        const { quantity } = req.body;
        const user_id = req.user.id;

        if (quantity < 1) return sendResponse(res, 400, "error", "Quantity minimal 1");

        const [result] = await db.execute(
            "UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?",
            [quantity, id, user_id]
        );

        if (result.affectedRows === 0) return sendResponse(res, 404, "error", "Item tidak ditemukan");

        sendResponse(res, 200, "success", "Quantity berhasil diupdate");
    } catch (error) {
        sendResponse(res, 500, "error", "Gagal update quantity");
    }
};

// 4. Hapus Item dari Keranjang
exports.removeFromCart = async (req, res) => {
    try {
        const { id } = req.params; // Cart ID
        const user_id = req.user.id;

        const [result] = await db.execute(
            "DELETE FROM cart WHERE id = ? AND user_id = ?", 
            [id, user_id]
        );

        if (result.affectedRows === 0) return sendResponse(res, 404, "error", "Item tidak ditemukan");

        sendResponse(res, 200, "success", "Item dihapus dari keranjang");
    } catch (error) {
        sendResponse(res, 500, "error", "Gagal menghapus item");
    }
};