const express = require('express');

const router = express.Router()


// Routes
router.get('/', testRoute);   //test Route
router.get('/api/products', getALLProduct);   // Get all products
router.get('/api/products/:id', getSingleProductById);   // Get single product by ID
router.post('/api/products', addProduct);  // Add product

const testRoute = (req, res) => {
    res.send('Server is running! 🚀');
}

const getALLProduct = (req, res) => {
    db.all("SELECT id, name, price, quantity FROM products", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
}

const getSingleProductById = (req, res) => {
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

// Update product
router.put('/api/products/:id', (req, res) => {
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
});

// Update product quantity
router.put('/api/products/:id/quantity', (req, res) => {
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
});

// Delete product by ID
router.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM products WHERE id = ?", id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Product deleted successfully" });
    });
});
