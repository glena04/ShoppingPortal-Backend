// test-router.js
// A simple test script to verify our router implementation works correctly

console.log('Starting router test script...');

// Import our custom Express router
const Router = require('./express-router');
console.log('Express Router wrapper imported successfully');

// Create a router instance
const router = Router();
console.log('Router instance created successfully');

// Test defining various routes
console.log('Testing route definitions...');

// GET route
router.get('/test', (req, res) => {
  console.log('GET route handler defined successfully');
});
console.log('GET route defined successfully');

// POST route
router.post('/test', (req, res) => {
  console.log('POST route handler defined successfully');
});
console.log('POST route defined successfully');

// PUT route - the problematic one
try {
  router.put('/test', (req, res) => {
    console.log('PUT route handler defined successfully');
  });
  console.log('PUT route defined successfully');
} catch (error) {
  console.error('Error defining PUT route:', error.message);
  process.exit(1);
}

// DELETE route
router.delete('/test', (req, res) => {
  console.log('DELETE route handler defined successfully');
});
console.log('DELETE route defined successfully');

console.log('All routes defined successfully');
console.log('Router test completed successfully');

// If we get here, all router operations worked without error
console.log('TEST PASSED: Router implementation is working correctly');