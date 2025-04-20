// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Setup SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Create table if it doesn't exist (without dropping existing table)
db.run("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price REAL, quantity INTEGER DEFAULT 0)", (err) => {
  if (err) {
    console.error("Error creating table:", err.message);
  } else {
    console.log("Products table created or already exists");
  }
});

// Optional: Check if the quantity column exists and add it if not
db.all("PRAGMA table_info(products)", [], (err, rows) => {
  if (err) {
    console.error("Error checking table schema:", err.message);
    return;
  }
  
  // Check if quantity column exists
  const hasQuantity = rows.some(row => row.name === 'quantity');
  
  if (!hasQuantity) {
    db.run("ALTER TABLE products ADD COLUMN quantity INTEGER DEFAULT 0", (err) => {
      if (err) {
        console.error("Error adding quantity column:", err.message);
      } else {
        console.log("Added quantity column to products table");
      }
    });
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('Server is running! 🚀');
});

// Get all products
app.get('/api/products', (req, res) => {
  db.all("SELECT id, name, price, quantity FROM products", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single product by ID
app.get('/api/products/:id', (req, res) => {
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
});

// Add product
app.post('/api/products', (req, res) => {
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
});

// Update product
app.put('/api/products/:id', (req, res) => {
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
app.put('/api/products/:id/quantity', (req, res) => {
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
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM products WHERE id = ?", id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Product deleted successfully" });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});