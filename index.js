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


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// Make the database available to routers
app.locals.db = db;

// Import routes
const routes = require('./router/index');
app.use('/', routes);
