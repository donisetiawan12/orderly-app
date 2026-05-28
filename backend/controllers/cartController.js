const db = require('../config/db'); // Sesuaikan path db lu
const { sendResponse } = require('../utils/response'); // Sesuaikan path helper response lu

// 1. Tambah Produk ke Keranjang
exports.addToCart = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const user_id = req.user.id;

        // Cek apakah produk sudah ada di keranjang
        const [existing] = await db.execute(
            "SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?",
            [user_id, product_id]
        );

        if (existing.length > 0) {
            await db.execute(
                "UPDATE cart SET quantity = quantity + ? WHERE id = ?",
                [quantity, existing[0].id]
            );
        } else {
            await db.execute(
                "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
                [user_id, product_id, quantity]
            );
        }

        sendResponse(res, 200, "success", "Berhasil ditambahkan ke keranjang");
    } catch (error) {
        sendResponse(res, 500, "error", "Gagal menambah ke keranjang");
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