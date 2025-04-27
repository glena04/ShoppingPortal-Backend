// Create products table if it doesn't exist
function createProduct(db) {
    return new Promise((resolve, reject) => {
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER DEFAULT 0
        )`, (err) => {
            if (err) {
                console.error("Error creating products table:", err.message);
                reject(new Error("Failed to create products table"));
            } else {
                console.log("Products table created or already exists");
                resolve();
            }
        });
    });
}

// Optional: Check if the quantity column exists and add it if not
function checkQuantityColumn(db) {
    return new Promise((resolve, reject) => {
        db.all("PRAGMA table_info(products)", [], (err, rows) => {
            if (err) {
                console.error("Error checking products table schema:", err.message);
                reject(new Error("Failed to check products table schema"));
            } else {
                // Check if quantity column exists
                const hasQuantity = rows.some(row => row.name === 'quantity');

                if (!hasQuantity) {
                    db.run("ALTER TABLE products ADD COLUMN quantity INTEGER DEFAULT 0", (err) => {
                        if (err) {
                            console.error("Error adding quantity column:", err.message);
                            reject(new Error("Failed to add quantity column"));
                        } else {
                            console.log("Added quantity column to products table");
                            resolve();
                        }
                    });
                } else {
                    resolve();
                }
            }
        });
    })
}

module.exports = { createProduct, checkQuantityColumn };