// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
console.log("Importing routers with absolute paths to avoid path resolution issues");
// Use absolute path to avoid path resolution issues
const routes = require('./router/index.js'); // Add explicit .js extension
const migration = require('./database');

// Perform database migration and set the database connection
(async () => {
    const db = await migration(); // Await the migration function to resolve the database connection
    if (db.error) {
        console.error('Database migration failed:', db.error);
        process.exit(1); // Exit the application if migration fails
    }

    app.locals.db = db; // Set the resolved database connection in app.locals
    console.log('Database connection set in app.locals');
})();
const authRouter = require('./router/auth.js'); // Add explicit .js extension

// some operations here

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const db = migration();
if (db.error) {
  console.error('Database migration failed:', db.error.message);
  process.exit(1); // Exit the application if migration fails
}

// Make the database available to routers
app.locals.db = db;

console.log('Main routes imported successfully');
try {

  console.log('Auth router imported successfully');
  console.log('Auth router is:', typeof authRouter);
  console.log('Auth router login route:', authRouter.stack ? 'Has routes' : 'No routes found');
} catch (error) {
  console.error('Error importing auth router:', error.message);
}

// Ensure we're using the correct router implementation
console.log('Routes type:', typeof routes);
console.log('Routes is Express router:', routes.constructor && routes.constructor.name);

// Use routes with extensive logging
app.use('/', routes);
console.log('Main routes mounted at /');

if (authRouter) {
  console.log('Auth router type:', typeof authRouter);
  console.log('Auth router is Express router:', authRouter.constructor && authRouter.constructor.name);
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
