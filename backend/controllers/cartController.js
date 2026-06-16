const db = require('../config/db');

// 1. Tambah Produk ke Keranjang (DENGAN HARD-LOCK KUOTA PO)
exports.addToCart = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const user_id = req.user.id; 
        const inputQty = Number(quantity);

        if (!product_id || !inputQty || inputQty < 1) {
            return res.status(400).json({ status: 'error', message: 'Data input kagak valid bray!' });
        }

        const [productCheck] = await db.execute(
            'SELECT name, po_quota, sold_quantity FROM products WHERE id = ?', 
            [product_id]
        );

        if (productCheck.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Produk tidak ditemukan bray!' });
        }

        const product = productCheck[0];
        const poQuota = Number(product.po_quota || 0);
        const soldQty = Number(product.sold_quantity || 0);

        if (poQuota > 0) {
            const sisaKuota = poQuota - soldQty;
            if (sisaKuota <= 0) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: `❌ Maaf bray, Kuota PO untuk "${product.name}" sudah FULL (${soldQty}/${poQuota}).` 
                });
            }
            if (inputQty > sisaKuota) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: `⚠️ Slot PO sisa ${sisaKuota} Pcs lagi bray. Lu gak bisa pesan sampai ${inputQty} Pcs!` 
                });
            }
        }

        const [cartCheck] = await db.execute(
            'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
        );

        if (cartCheck.length > 0) {
            const currentCartQty = Number(cartCheck[0].quantity);
            const newTotalQty = currentCartQty + inputQty;
            
            if (poQuota > 0) {
                const sisaKuota = poQuota - soldQty;
                if (newTotalQty > sisaKuota) {
                    return res.status(400).json({ 
                        status: 'error', 
                        message: `⚠️ Di keranjangmu udah ada ${currentCartQty} Pcs. Tambah ${inputQty} Pcs lagi bakal ngelebihin kuota PO!` 
                    });
                }
            }

            await db.execute('UPDATE cart SET quantity = ? WHERE id = ?', [newTotalQty, cartCheck[0].id]);
        } else {
            await db.execute('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [user_id, product_id, inputQty]);
        }

        return res.status(200).json({ status: 'success', message: `🎉 Berhasil masuk keranjang!` });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: 'Server error gagal memproses keranjang.' });
    }
};

// 2. AMBIL DATA KERANJANG (VERSI SUPER COMPATIBLE - ANTI UNDEFINED CO)
exports.getCartItems = async (req, res) => {
    try {
        const user_id = req.user.id;
        
        // Gua select p.id AS id DAN c.product_id AS product_id biar frontend gak bakal dapet 'undefined' mau pake cara manggil yang mana pun!
        const [items] = await db.execute(
            `SELECT 
                c.id AS cart_id, 
                p.id AS id, 
                c.product_id AS product_id, 
                c.quantity, 
                p.name, 
                p.price, 
                p.image 
             FROM cart c 
             JOIN products p ON c.product_id = p.id 
             WHERE c.user_id = ?`,
            [user_id]
        );
        
        return res.status(200).json({ status: 'success', data: items });
    } catch (error) {
        console.error("Error getCartItems bray:", error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

// 3. 🔥 AMANKAN FUNGSI HAPUS BIAR GAK CRASH BARIS 10!
exports.removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM cart WHERE id = ?', [id]);
        return res.status(200).json({ status: 'success', message: 'Item dihapus bray!' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};