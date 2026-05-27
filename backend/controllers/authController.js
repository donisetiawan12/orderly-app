const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ============ REGISTER ============
exports.register = async (req, res) => {
    try {
        // Validasi input
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ 
                status: 400,
                message: "Name, email, dan password harus diisi!" 
            });
        }

        // Validasi role (hanya admin, seller, buyer yang diperbolehkan)
        const validRoles = ['admin', 'seller', 'buyer'];
        const userRole = role && validRoles.includes(role) ? role : 'buyer';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert ke database
        const sql = "INSERT INTO users (name, email, password, role, verification_status) VALUES (?, ?, ?, ?, ?)";
        const [result] = await db.execute(sql, [name, email, hashedPassword, userRole, 'pending']);

        return res.status(201).json({
            status: 201,
            message: "User berhasil terdaftar!",
            userId: result.insertId,
            role: userRole
        });

    } catch (error) {
        console.error('❌ Register Error:', error.message);
        
        // Handle duplicate email
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: 409,
                message: "Email sudah terdaftar!"
            });
        }

        return res.status(500).json({
            status: 500,
            message: "Kesalahan internal server",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============ LOGIN ============
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) {
            return res.status(400).json({
                status: 400,
                message: "Email dan password harus diisi!"
            });
        }

        // Cari user berdasarkan email
        const sql = "SELECT id, name, email, password, role, verification_status FROM users WHERE email = ?";
        const [rows] = await db.execute(sql, [email]);

        if (rows.length === 0) {
            return res.status(401).json({
                status: 401,
                message: "Email atau password salah!"
            });
        }

        const user = rows[0];

        // Validasi password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 401,
                message: "Email atau password salah!"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                role: user.role,
                name: user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        return res.status(200).json({
            status: 200,
            message: "Login sukses!",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                verification_status: user.verification_status
            }
        });

    } catch (error) {
        console.error('❌ Login Error:', error.message);
        return res.status(500).json({
            status: 500,
            message: "Kesalahan internal server",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};