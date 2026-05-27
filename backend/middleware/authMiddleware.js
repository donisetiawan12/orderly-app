const jwt = require('jsonwebtoken');

// Middleware untuk memverifikasi apakah token ada dan valid
const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

    if (!token) {
        return res.status(401).json({ status: 401, message: "Akses ditolak! Token tidak ditemukan." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(403).json({ status: 403, message: "Token tidak valid!" });
    }
};

// Middleware untuk verifikasi role
const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ status: 403, message: "Anda tidak punya izin akses!" });
        }
        next();
    };
};

module.exports = { verifyToken, verifyRole };