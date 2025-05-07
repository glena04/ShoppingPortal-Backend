// router/index.js
const express = require('express');
// Import our dedicated Express Router wrapper to avoid package conflicts
const Router = require('../express-router');
// Create router using our dedicated Express Router wrapper
const router = Router();
console.log("Creating Express router for product routes using dedicated wrapper");
const { authenticateToken, isAdmin } = require('./auth');




// Function definitions
const testRoute = (req, res) => {
    res.send('Server is running! 🚀');
}

const getALLProduct = (req, res) => {
    const db = req.app.locals.db;
    // Access db from app.locals
    db.all("SELECT id, name, price, quantity FROM products", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
}

const getSingleProductById = (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    db.get("SELECT id, name, price, quantity FROM products WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        res.json(row);
    });
}

const addProduct = (req, res) => {
    const db = req.app.locals.db;
    const { name, price, quantity } = req.body;
    
    // Validate input
    if (!name || !price) {
        return res.status(400).json({ error: "Name and price are required" });
    }
    
    const stmt = db.prepare("INSERT INTO products (name, price, quantity) VALUES (?, ?, ?)");
    stmt.run(name, price, quantity || 0, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, name, price, quantity: quantity || 0 });
    });
    stmt.finalize();
}

const updateProduct = (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { name, price, quantity } = req.body;
    
    // Validate input
    if (!name || !price) {
        return res.status(400).json({ error: "Name and price are required" });
    }
    
    db.run(
        "UPDATE products SET name = ?, price = ?, quantity = ? WHERE id = ?",
        [name, price, quantity, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: "Product not found" });
            }
            
            res.json({ id, name, price, quantity });
        }
    );
}

const updateProductQuantity = (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { quantity } = req.body;
    
    // Validate input
    if (quantity === undefined) {
        return res.status(400).json({ error: "Quantity is required" });
    }
    
    db.run(
        "UPDATE products SET quantity = ? WHERE id = ?",
        [quantity, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: "Product not found" });
            }
            
            res.json({ id, quantity });
        }
    );
}

const deleteProduct = (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    db.run("DELETE FROM products WHERE id = ?", id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        res.json({ message: "Product deleted successfully" });
    });
}

// Now define routes
router.get('/', testRoute);

// Public routes - no authentication required
router.get('/api/products', getALLProduct);
router.get('/api/products/:id', getSingleProductById);

// Protected routes - authentication required
// Cashiers can update product quantities
router.put('/api/products/:id/quantity', authenticateToken, updateProductQuantity);

// Admin-only routes - authentication and admin role required
router.post('/api/products', authenticateToken, isAdmin, addProduct);
router.put('/api/products/:id', authenticateToken, isAdmin, updateProduct);
router.delete('/api/products/:id', authenticateToken, isAdmin, deleteProduct);

module.exports = router;
