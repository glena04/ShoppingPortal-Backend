// Create users table if it doesn't exist
function createUsers(db) {
    return new Promise((resolve, reject) => {
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
                reject(new Error("Failed to create users table"));
            } else {
                console.log("Users table created or already exists");
                resolve();
            }
        });
    });
}

module.exports = { createUsers };