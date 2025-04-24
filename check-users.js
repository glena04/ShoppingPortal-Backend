// check-users.js
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();

console.log("Starting check-users.js script...");
console.log("Current working directory:", process.cwd());

// Connect to the database
console.log("Attempting to connect to database at ./database.db");
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
        process.exit(1);
    }
    
    console.log("Connected to the SQLite database.");
    
    // List all tables
    console.log("Listing all tables in the database:");
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
            console.error("Error listing tables:", err.message);
            closeDb();
            return;
        }
        
        if (tables.length === 0) {
            console.log("No tables found in the database!");
            closeDb();
            return;
        }
        
        console.log("Tables in the database:");
        tables.forEach(table => {
            console.log(`- ${table.name}`);
        });
        
        // Check if users table exists
        const usersTable = tables.find(table => table.name === 'users');
        if (!usersTable) {
            console.log("The 'users' table does not exist!");
            closeDb();
            return;
        }
        
        console.log("The 'users' table exists.");
        
        // Get schema of users table
        console.log("Getting schema of users table:");
        db.all("PRAGMA table_info(users)", [], (err, columns) => {
            if (err) {
                console.error("Error getting table schema:", err.message);
                closeDb();
                return;
            }
            
            console.log("Columns in users table:");
            columns.forEach(column => {
                console.log(`- ${column.name} (${column.type})`);
            });
            
            // Query all users
            console.log("Querying all users:");
            db.all("SELECT * FROM users", [], (err, users) => {
                if (err) {
                    console.error("Error querying users:", err.message);
                    closeDb();
                    return;
                }
                
                if (users.length === 0) {
                    console.log("No users found in the database.");
                    closeDb();
                    return;
                }
                
                console.log(`Found ${users.length} users in the database:`);
                users.forEach((user, i) => {
                    console.log(`User ${i + 1}:`);
                    for (const key in user) {
                        if (key === 'password') {
                            console.log(`  ${key}: ${user[key].substring(0, 20)}...`);
                        } else {
                            console.log(`  ${key}: ${user[key]}`);
                        }
                    }
                    console.log('---');
                });
                
                closeDb();
            });
        });
    });
});

function closeDb() {
    db.close((err) => {
        if (err) {
            console.error("Error closing database:", err.message);
        } else {
            console.log("Database connection closed.");
        }
        console.log("Script completed.");
        process.exit(0);
    });
}
