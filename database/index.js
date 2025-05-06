const { createUsers } = require('./user');
const { createProduct, checkQuantityColumn } = require('./product');
const dbConecction = require('./init');

async function migration() {
    try {
        const db = await dbConecction();
        console.log('Database connection established.');
        await createUsers(db);
        console.log('Users table created or verified.');
        await createProduct(db);
        console.log('Products table created or verified.');
        await checkQuantityColumn(db); 
        console.log("Database migration completed successfully.");
        return db; 
    } catch (error) {
        console.error("Error in db migration:", error.message);
        return { error: "Database migration failed" };
    }
}

module.exports = migration;