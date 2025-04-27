const sqlite3 = require('sqlite3').verbose();

function dbConecction() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('../database.db', (err) => {
            if (err) {
                console.error("Failed to connect to the database:", err.message);
                reject(new Error("Failed to connect to the database: " + err.message));
            } else {
                console.log("Connected to the SQLite database successfully.");
                resolve(db);
            }
        });
    });
}

module.exports = dbConecction;