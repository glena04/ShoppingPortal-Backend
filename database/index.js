const { createUsers } = require('./user');
const { createProduct } = require('./product');
const dbConecction = require('./init');

async function migration() {
    try {
        const db = await dbConecction();
        await createUsers(db);
        await createProduct(db);
        await checkQuantityColumn(db);
        console.log("Database migration completed successfully.");
    } catch (error) {
        console.error("Error in db migration:", error.message);
        return { error: "Database migration failed" };
    }
}

module.exports = migration; 