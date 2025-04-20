// cleanup-database.js
// Run this script to fix your locked database issue
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'database.db');
const journalPath = dbPath + '-journal';

console.log("Checking for database files...");

// Check if journal file exists (sign of unfinished transaction)
if (fs.existsSync(journalPath)) {
  console.log("Found journal file. This indicates an unfinished transaction.");
  
  try {
    // Try to delete the journal file
    fs.unlinkSync(journalPath);
    console.log("Deleted journal file successfully.");
  } catch (err) {
    console.error("Could not delete journal file:", err.message);
  }
}

// Try opening the database to check if it's usable
console.log("Attempting to open database...");
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error("Could not open database:", err.message);
    console.log("Database may be corrupted or still locked.");
    
    // If we can't open it, try deleting and creating a fresh one
    console.log("Attempting to create a fresh database...");
    
    try {
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        console.log("Deleted existing database file.");
      }
      
      // Create a new database
      const newDb = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error("Failed to create new database:", err.message);
          process.exit(1);
        }
        
        console.log("Created fresh database file.");
        console.log("Please run your server now.");
        process.exit(0);
      });
    } catch (err) {
      console.error("Error creating fresh database:", err.message);
      process.exit(1);
    }
  } else {
    console.log("Database opened successfully!");
    
    // Check if products table exists and has data
    db.get("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='products'", [], (err, row) => {
      if (err) {
        console.error("Error checking for products table:", err.message);
        db.close();
        return;
      }
      
      if (row.count === 0) {
        console.log("Products table doesn't exist. Your server will create it when started.");
      } else {
        // Check if products table has data
        db.get("SELECT COUNT(*) as count FROM products", [], (err, row) => {
          if (err) {
            console.error("Error checking products count:", err.message);
          } else {
            console.log(`Products table has ${row.count} products.`);
          }
        });
      }
      
      console.log("Database appears to be in good condition.");
      console.log("You can now run your server.");
      
      // Close the database
      db.close(() => {
        console.log("Database connection closed.");
        process.exit(0);
      });
    });
  }
});