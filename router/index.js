// router/index.js
const express = require('express');
const router = express.Router();

// Function definitions
const testRoute = (req, res) => {
    res.send('Server is running! 🚀');
}

const getALLProduct = (req, res) => {
    const db = req.app.locals.db;       // was missing in the original code
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
    db.run(
        "UPDATE products SET name = ?, price = ?, quantity = ? WHERE id = ?",
        [name, price, quantity, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id, name, price, quantity });
        }
    );
}

const updateProductQuantity = (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { quantity } = req.body;
    db.run(
        "UPDATE products SET quantity = ? WHERE id = ?",
        [quantity, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
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
        res.json({ message: "Product deleted successfully" });
    });
}

// Now define routes
router.get('/', testRoute);
router.get('/api/products', getALLProduct);
router.get('/api/products/:id', getSingleProductById);
router.post('/api/products', addProduct);
router.put('/api/products/:id', updateProduct);
router.put('/api/products/:id/quantity', updateProductQuantity);
router.delete('/api/products/:id', deleteProduct);

module.exports = router;