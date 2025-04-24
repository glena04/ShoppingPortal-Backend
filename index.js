// server.js
require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const jwt = require('jsonwebtoken');

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

// Create products table if it doesn't exist
db.run("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price REAL, quantity INTEGER DEFAULT 0)", (err) => {
  if (err) {
    console.error("Error creating products table:", err.message);
  } else {
    console.log("Products table created or already exists");
  }
});

// Create users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cashier',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error("Error creating users table:", err.message);
  } else {
    console.log("Users table created or already exists");
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


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// Make the database available to routers
app.locals.db = db;

// Import routes
const routes = require('./router/index');
console.log('Main routes imported successfully');

// Import auth router with explicit logging
let authRouter;
try {
  authRouter = require('./router/auth');
  console.log('Auth router imported successfully');
  console.log('Auth router is:', typeof authRouter);
  console.log('Auth router login route:', authRouter.stack ? 'Has routes' : 'No routes found');
} catch (error) {
  console.error('Error importing auth router:', error.message);
}

// Use routes with extensive logging
app.use('/', routes);
console.log('Main routes mounted at /');

if (authRouter) {
  app.use('/api/auth', authRouter);
  console.log('Auth routes mounted at /api/auth');
  
  // Add direct route for auth testing
  app.get('/auth-test', (req, res) => {
    res.json({ message: 'Direct auth test route is working' });
  });
  console.log('Added direct auth test route at /auth-test');
} else {
  console.error('Auth router not mounted due to import error');
}

// Add direct test endpoint at root level for debugging
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});
console.log('Added test endpoint at /test');
