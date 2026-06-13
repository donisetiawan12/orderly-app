const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Sesuaikan path config DB lu bray
const multer = require('multer');
const path = require('path');

// ============ CONFIGURATION MULTER (UNTUK QRIS) ============
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/payments/'); // Pastiin folder ini udah lu bikin di MacBook lu bray!
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'qris-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// 📁 File: backend/routes/payments.js (atau sejenisnya di backend lu)

router.get('/get-payment', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID wajib diisi bray!" });
    }

    // 1️⃣ Query pertama: Ambil data rekening & QRIS dari tabel seller_payments
    const [paymentData] = await db.query(
      "SELECT bank_name, account_name, account_number, qris_image FROM seller_payments WHERE user_id = ?", 
      [userId]
    );

    // 2️⃣ Query kedua: Hitung total omzet & jumlah pesanan sukses dari tabel transaksi lu
    // 💡 CATATAN: Ganti "nama_tabel_transaksi_lu" pake nama tabel asli di database lu (misal: orders atau transactions)
  const [statsData] = await db.query(
  "SELECT SUM(total_price) as total_omzet, COUNT(id) as total_sales FROM orders WHERE seller_id = ? AND status = 'completed'", 
  [userId]
);

    // Ambil data payment kalau ada, kalau user baru/belum setting isinya dibikin objek kosong dulu bray
    const dataPaymentUtama = paymentData.length > 0 ? paymentData[0] : {};

    // 3️⃣ Kirim gabungan datanya ke Frontend Next.js bray!
    return res.json({
      success: true,
      data: {
        ...dataPaymentUtama, // isinya: bank_name, account_name, dll
        total_omzet: statsData[0].total_omzet || 0,   // total duit masuk dari transaksi completed
        total_sales: statsData[0].total_sales || 0    // total jumlah pesanan yang completed
      }
    });

  } catch (error) {
    console.error("Eror pas get payment & stats bray:", error);
    return res.status(500).json({ success: false, message: "Gagal memuat data dari server backend." });
  }
});


// ============ 2. ROUTE POST: SIMPAN / UPDATE REKENING BANK ============
router.post('/save-bank', async (req, res) => {
    try {
        const { user_id, bank_name, account_name, account_number } = req.body;

        if (!user_id || !bank_name || !account_name || !account_number) {
            return res.status(400).json({ success: false, message: "Data tidak boleh kosong bray!" });
        }

        // Pakai ON DUPLICATE KEY UPDATE biar kalau user_id udah ada, dia otomatis EDIT bray!
        const sql = `
            INSERT INTO seller_payments (user_id, bank_name, account_name, account_number) 
            VALUES (?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
                bank_name = VALUES(bank_name), 
                account_name = VALUES(account_name), 
                account_number = VALUES(account_number)
        `;
        
        await db.execute(sql, [user_id, bank_name, account_name, account_number]);

        return res.status(200).json({ success: true, message: "Data rekening berhasil diperbarui bray!" });

    } catch (error) {
        console.error('❌ Gagal simpan rekening:', error.message);
        return res.status(500).json({ success: false, message: "Kesalahan internal server bray" });
    }
});


// ============ 3. ROUTE POST: UPLOAD / UPDATE FILE QRIS TOKO ============
router.post('/upload-qris', upload.single('qris'), async (req, res) => {
    try {
        const { user_id } = req.body;
        
        if (!user_id) {
            return res.status(400).json({ success: false, message: "User ID wajib diisi bray!" });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: "File QRIS mana bray? Belum ke-upload!" });
        }

        const filename = req.file.filename;

        // Sama bray, pakai ON DUPLICATE KEY UPDATE biar kalau gambar diganti, langsung ke-timpa otomatis
        const sql = `
            INSERT INTO seller_payments (user_id, qris_image) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE 
                qris_image = VALUES(qris_image)
        `;
        
        await db.execute(sql, [user_id, filename]);

        return res.status(200).json({ 
            success: true, 
            message: "QRIS berhasil disimpan bray!", 
            filename: filename 
        });

    } catch (error) {
        console.error('❌ Gagal upload QRIS:', error.message);
        return res.status(500).json({ success: false, message: "Gagal memproses upload QRIS bray" });
    }
});

module.exports = router;