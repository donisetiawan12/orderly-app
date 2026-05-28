const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ status: "error", message: "Akses ditolak! Token tidak ditemukan." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(403).json({ status: "error", message: "Token kadaluarsa atau tidak valid!" });
    }
};

const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Cek apakah user sudah ter-autentikasi dan rolenya diizinkan
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ status: "error", message: "Anda tidak memiliki izin untuk akses ini!" });
        }
        next();
    };
};

module.exports = { verifyToken, verifyRole };