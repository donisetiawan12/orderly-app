const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ============ REGISTER ============
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ status: 400, message: "Name, email, dan password harus diisi!" });
        }

        const validRoles = ['admin', 'seller', 'buyer'];
        const userRole = role && validRoles.includes(role) ? role : 'buyer';

        // Validasi KTM untuk Seller
        if (userRole === 'seller' && !req.file) {
            return res.status(400).json({ status: 400, message: "Registrasi seller wajib mengupload foto KTM!" });
        }

        const ktmPath = req.file ? req.file.path : null;
        const status = (userRole === 'buyer') ? 'approved' : 'pending';

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (name, email, password, role, verification_status, ktm_path) VALUES (?, ?, ?, ?, ?, ?)";
        const [result] = await db.execute(sql, [name, email, hashedPassword, userRole, status, ktmPath]);

        return res.status(201).json({
            status: 201,
            message: userRole === 'buyer' ? "Registrasi berhasil!" : "Registrasi berhasil! Menunggu verifikasi admin.",
            userId: result.insertId,
            role: userRole
        });

    } catch (error) {
        console.error('❌ Register Error:', error.message);
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ status: 409, message: "Email sudah terdaftar!" });
        return res.status(500).json({ status: 500, message: "Kesalahan internal server" });
    }
};

// ============ LOGIN ============
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ status: 400, message: "Email dan password harus diisi!" });

        const sql = "SELECT id, name, email, password, role, verification_status FROM users WHERE email = ?";
        const [rows] = await db.execute(sql, [email]);

        if (rows.length === 0) return res.status(401).json({ status: 401, message: "Email atau password salah!" });

        const user = rows[0];

        if (user.role === 'seller' && user.verification_status !== 'approved') {
            return res.status(403).json({ status: 403, message: "Akun seller Anda belum diverifikasi oleh admin." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ status: 401, message: "Email atau password salah!" });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            status: 200,
            message: "Login sukses!",
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, verification_status: user.verification_status }
        });

    } catch (error) {
        console.error('❌ Login Error:', error.message);
        return res.status(500).json({ status: 500, message: "Kesalahan internal server" });
    }
};

// ============ ADMIN: GET PENDING SELLERS ============
exports.getPendingSellers = async (req, res) => {
    try {
        // 🔥 Ditambah ambil phone biar di tabel Next.js lu kagak kosong bray!
        // Ganti baris query sql lama lu di backend dengan ini biar dapet semua status urut dari ID terbesar bray:
        // 🔥 UPDATE DI BACKEND LU BRAY (Tambahin created_at)
// 🔥 UPDATE DI BACKEND LU BRAY (Hapus filter role, biar buyer & seller ketarik semua)
const sql = "SELECT id, name, email, phone, role, ktm_path, verification_status, created_at FROM users WHERE role IN ('seller', 'buyer') ORDER BY id DESC";
        const [rows] = await db.execute(sql);
        
        // Bersihkan string ktm_path dari nama folder (misal dari 'src/uploads/ktm/foto.png' jadi cuma 'foto.png')
        // Biar di frontend manggilnya mulus tanpa double path bray!
        const cleanedRows = rows.map(user => {
            if (user.ktm_path && user.ktm_path.includes('/')) {
                user.ktm_path = user.ktm_path.split('/').pop();
            } else if (user.ktm_path && user.ktm_path.includes('\\')) {
                user.ktm_path = user.ktm_path.split('\\').pop();
            }
            return user;
        });

        res.status(200).json({ status: 200, data: cleanedRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Gagal ambil data seller" });
    }
};

// ============ ADMIN: VERIFY SELLER (ACC / TOLAK DINAMIS) ============
exports.approveSeller = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 🔥 Mengambil status ('approved' / 'rejected') kiriman dari Next.js

        const finalStatus = status === 'rejected' ? 'rejected' : 'approved';

        const sql = "UPDATE users SET verification_status = ? WHERE id = ?";
        await db.execute(sql, [finalStatus, id]);
        
        res.status(200).json({ status: 200, message: `Seller berhasil di-${finalStatus}!` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Gagal update status verifikasi bray" });
    }
};

// ============ ADMIN: GET TOTAL BUYERS REAL-TIME ============
exports.getTotalBuyers = async (req, res) => {
    try {
        // Hitung total user yang role-nya 'buyer'
        const sql = "SELECT COUNT(*) as total FROM users WHERE role = 'buyer'";
        const [rows] = await db.execute(sql);
        
        return res.status(200).json({ 
            status: 'success', 
            total_buyers: rows[0].total 
        });
    } catch (error) {
        console.error('❌ Get Total Buyers Error:', error.message);
        return res.status(500).json({ status: 500, message: "Gagal hitung buyer asli bray" });
    }
};