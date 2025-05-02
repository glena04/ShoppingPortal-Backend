const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database'); // Replace with your database connection
const JWT_SECRET = process.env.JWT_SECRET || 'your_secure_jwt_secret_key_for_pos_system';

// Register a new user
const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || 'cashier';

        const stmt = db.prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)");
        stmt.run(username, email, hashedPassword, userRole, function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: "Username or email already exists" });
                }
                return res.status(500).json({ error: err.message });
            }

            const token = jwt.sign({ id: this.lastID, username, role: userRole }, JWT_SECRET, { expiresIn: '1h' });
            res.status(201).json({ user: { id: this.lastID, username, email, role: userRole }, token });
        });
        stmt.finalize();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login a user
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(400).json({ error: "Invalid username or password" });

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) return res.status(400).json({ error: "Invalid username or password" });

            const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role }, token });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get current user profile
const getUserProfile = (req, res) => {
    db.get("SELECT id, username, email, role FROM users WHERE id = ?", [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    });
};

// Update user profile
const updateUserProfile = async (req, res) => {
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
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push("password = ?");
            params.push(hashedPassword);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        params.push(req.user.id);
        const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;

        db.run(query, params, function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: "User not found" });
            res.json({ message: "Profile updated successfully" });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a user
const deleteUser = (req, res) => {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
        return res.status(403).json({ error: "You cannot delete your own account" });
    }

    db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "User not found" });
        res.json({ message: "User deleted successfully" });
    });
};

// Get all users
const getAllUsers = (req, res) => {
    db.all("SELECT id, username, email, role FROM users", [], (err, users) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(users);
    });
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,
    getAllUsers,
};