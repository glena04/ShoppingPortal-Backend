const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a connection to the SQLite database
const dbPath = path.resolve(__dirname, 'database.db'); // Ensure 'database.db' exists in the backend folder
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

module.exports = db; 