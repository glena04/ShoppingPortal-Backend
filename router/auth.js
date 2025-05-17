// router/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
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
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: "Invalid token" });
    }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Admin role required." });
    }
    next();
};

// Login user
router.post('/login', async (req, res) => {
    console.log("Login endpoint hit");

    // Access the database from app.locals
    const db = req.app.locals.db;

  

    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        // Find the user
        db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
            if (err) {
                console.error("Database error:", err.message);
                return res.status(500).json({ error: err.message });
            }

            if (!user) {
                console.log("User not found:", username);
                return res.status(400).json({ error: "Invalid username or password" });
            }

            // Check password
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                console.log("Invalid password for user:", username);
                return res.status(400).json({ error: "Invalid username or password" });
            }

            // Create and assign a token
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: '5m' }
            );

            console.log("Login successful for user:", username);
            res.json({
                message: "Login successful",
                token,
                user: { id: user.id, username: user.username, email: user.email, role: user.role }
            });
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Register a new user
router.post('/register', async (req, res) => {
    const db = req.app.locals.db;
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required" });
    }

    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Default role to 'cashier' if not provided or if the requesting user is not an admin
        const userRole = (req.user && req.user.role === 'admin') ? (role || 'cashier') : 'cashier';

        // Insert the new user
        const stmt = db.prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)");
        stmt.run(username, email, hashedPassword, userRole, function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: "Username or email already exists" });
                }
                return res.status(500).json({ error: err.message });
            }

            // Create and assign a token
            const token = jwt.sign(
                { id: this.lastID, username, role: userRole },
                JWT_SECRET,
                { expiresIn: '5m' }
            );

            res.status(201).json({
                message: "User registered successfully",
                token,
                user: { id: this.lastID, username, email, role: userRole }
            });
        });
        stmt.finalize();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Delete a user (admin only)
router.delete('/users/:id', authenticateToken, isAdmin, (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;

    // Prevent admins from deleting their own account
    if (parseInt(id) === req.user.id) {
        return res.status(403).json({ error: "You cannot delete your own account" });
    }

    db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    });
});



// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
    const db = req.app.locals.db;

    db.get("SELECT id, username, email, role, created_at FROM users WHERE id = ?", [req.user.id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    });
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    const db = req.app.locals.db;
    const { username, email, password } = req.body;

    try {
        let updates = [];
        let params = [];

        if (username) {
            updates.push("username = ?");
            params.push(username);
        }

        if (email) {
            updates.push("email = ?");
            params.push(email);
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updates.push("password = ?");
            params.push(hashedPassword);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        // Add user ID to params
        params.push(req.user.id);

        const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;

        db.run(query, params, function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: "Username or email already exists" });
                }
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            res.json({ message: "Profile updated successfully" });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all users (admin only)
router.get('/users', authenticateToken, isAdmin, (req, res) => {
    const db = req.app.locals.db;

    db.all("SELECT id, username, email, role, created_at FROM users", [], (err, users) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(users);
    });
});

// Test route to check if auth router is working
router.get('/test', (req, res) => {
    res.json({ message: "Auth router is working" });
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.isAdmin = isAdmin;