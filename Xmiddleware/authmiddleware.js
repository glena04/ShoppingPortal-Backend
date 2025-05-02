const jwt = require('jsonwebtoken');

// Get JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_secure_jwt_secret_key_for_pos_system';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified; // Attach the decoded token payload to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(400).json({ error: "Invalid token" });
    }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Admin role required." });
    }
    next(); // Proceed to the next middleware or route handler
};

module.exports = {
    authenticateToken,
    isAdmin,
};