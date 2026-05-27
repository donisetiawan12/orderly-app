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
        const sql = "SELECT id, name, email, ktm_path FROM users WHERE role = 'seller' AND verification_status = 'pending'";
        const [rows] = await db.execute(sql);
        res.status(200).json({ status: 200, data: rows });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Gagal ambil data seller" });
    }
};

// ============ ADMIN: APPROVE SELLER ============
exports.approveSeller = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = "UPDATE users SET verification_status = 'approved' WHERE id = ?";
        await db.execute(sql, [id]);
        res.status(200).json({ status: 200, message: "Seller berhasil diverifikasi!" });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Gagal update status" });
    }
};