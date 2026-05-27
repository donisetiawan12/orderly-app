const jwt = require('jsonwebtoken');

/**
 * Middleware untuk verifikasi JWT token
 * Mengekstrak userId, email, dan role dari token
 */
exports.verifyToken = (req, res, next) => {
    try {
        // Ambil token dari header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 401,
                message: "Token tidak ditemukan atau format salah (gunakan: Bearer <token>)"
            });
        }

        const token = authHeader.substring(7); // Ambil bagian setelah "Bearer "

        // Verifikasi token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user data ke req object
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name
        };

        next();

    } catch (error) {
        console.error('❌ Token Verification Error:', error.message);

        // Handle token expired
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 401,
                message: "Token sudah kadaluarsa, silakan login kembali"
            });
        }

        // Handle invalid token
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 401,
                message: "Token tidak valid"
            });
        }

        return res.status(500).json({
            status: 500,
            message: "Kesalahan verifikasi token"
        });
    }
};

/**
 * Middleware untuk verifikasi role (Admin, Seller, Buyer)
 * Gunakan setelah verifyToken
 * 
 * Contoh penggunaan:
 * router.post('/admin-only', verifyToken, verifyRole('admin'), controllerFunc);
 */
exports.verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 401,
                message: "User tidak terautentikasi"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: 403,
                message: `Akses ditolak. Role yang diperbolehkan: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Middleware untuk mengecek apakah user sudah verifikasi (untuk seller)
 */
exports.verifyVerified = (req, res, next) => {
    // Untuk tahap awal, kita skip ini
    // Nanti akan diimplementasikan saat admin bisa verifikasi seller
    next();
};