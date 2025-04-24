// create-admin-user.js
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// Admin user details
const adminUser = {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123', // This should be changed after first login
    role: 'admin'
};

// Connect to the database
const db = new sqlite3.Database('./database.db', async (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
        process.exit(1);
    }
    
    console.log("Connected to the SQLite database.");
    
    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminUser.password, salt);
        
        // Check if admin user already exists
        db.get("SELECT * FROM users WHERE username = ? OR email = ?", 
            [adminUser.username, adminUser.email], 
            (err, user) => {
                if (err) {
                    console.error("Error checking for existing admin:", err.message);
                    closeDb();
                    return;
                }
                
                if (user) {
                    console.log("Admin user already exists.");
                    closeDb();
                    return;
                }
                
                // Insert admin user
                const stmt = db.prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)");
                stmt.run(adminUser.username, adminUser.email, hashedPassword, adminUser.role, function(err) {
                    if (err) {
                        console.error("Error creating admin user:", err.message);
                        closeDb();
                        return;
                    }
                    
                    console.log(`Admin user created successfully with ID: ${this.lastID}`);
                    console.log("Username:", adminUser.username);
                    console.log("Password:", adminUser.password);
                    console.log("Role:", adminUser.role);
                    console.log("\nIMPORTANT: Change this password after first login!");
                    
                    closeDb();
                });
                stmt.finalize();
            }
        );
    } catch (error) {
        console.error("Error creating admin user:", error.message);
        closeDb();
    }
});

function closeDb() {
    db.close((err) => {
        if (err) {
            console.error("Error closing database:", err.message);
        } else {
            console.log("Database connection closed.");
        }
        process.exit(0);
    });
}
