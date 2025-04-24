// test-auth.js
const axios = require('axios');

// Base URL for the API
const API_URL = 'http://localhost:5000/api';

// Test user credentials
const testUser = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'password123'
};

// Admin user credentials (from create-admin-user.js)
const adminUser = {
    username: 'admin',
    password: 'admin123'
};

// Store tokens
let userToken = '';
let adminToken = '';

// Helper function to log responses
const logResponse = (title, data) => {
    console.log('\n' + '='.repeat(50));
    console.log(title);
    console.log('='.repeat(50));
    console.log(JSON.stringify(data, null, 2));
};

// Helper function to log errors
const logError = (title, error) => {
    console.log('\n' + '='.repeat(50));
    console.log(title);
    console.log('='.repeat(50));
    if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
        console.log('Error:', error.message);
    }
};

// Test registration
const testRegistration = async () => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, testUser);
        logResponse('REGISTER USER', response.data);
        userToken = response.data.token;
        return true;
    } catch (error) {
        logError('REGISTER USER ERROR', error);
        return false;
    }
};

// Test login with admin user
const testAdminLogin = async () => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, adminUser);
        logResponse('ADMIN LOGIN', response.data);
        adminToken = response.data.token;
        return true;
    } catch (error) {
        logError('ADMIN LOGIN ERROR', error);
        return false;
    }
};

// Test login with regular user
const testUserLogin = async () => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            username: testUser.username,
            password: testUser.password
        });
        logResponse('USER LOGIN', response.data);
        userToken = response.data.token;
        return true;
    } catch (error) {
        logError('USER LOGIN ERROR', error);
        return false;
    }
};

// Test getting user profile
const testGetProfile = async () => {
    try {
        const response = await axios.get(`${API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        logResponse('GET USER PROFILE', response.data);
        return true;
    } catch (error) {
        logError('GET USER PROFILE ERROR', error);
        return false;
    }
};

// Test getting all users (admin only)
const testGetAllUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/auth/users`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        logResponse('GET ALL USERS (ADMIN)', response.data);
        return true;
    } catch (error) {
        logError('GET ALL USERS ERROR', error);
        return false;
    }
};

// Test adding a product (admin only)
const testAddProduct = async () => {
    try {
        const product = {
            name: 'Test Product',
            price: 19.99,
            quantity: 100
        };
        
        // Try with regular user (should fail)
        try {
            await axios.post(`${API_URL}/products`, product, {
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
        } catch (error) {
            logResponse('ADD PRODUCT WITH REGULAR USER (EXPECTED TO FAIL)', {
                status: error.response.status,
                error: error.response.data
            });
        }
        
        // Try with admin user (should succeed)
        const response = await axios.post(`${API_URL}/products`, product, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        logResponse('ADD PRODUCT WITH ADMIN USER', response.data);
        return true;
    } catch (error) {
        logError('ADD PRODUCT ERROR', error);
        return false;
    }
};

// Run all tests
const runTests = async () => {
    console.log('STARTING AUTHENTICATION TESTS');
    console.log('Make sure the server is running on http://localhost:5000');
    
    // Login as admin (should already exist from create-admin-user.js)
    await testAdminLogin();
    
    // Register a new test user
    const registered = await testRegistration();
    
    // If registration failed (user might already exist), try logging in
    if (!registered) {
        await testUserLogin();
    }
    
    // Test getting user profile
    await testGetProfile();
    
    // Test admin-only endpoint
    await testGetAllUsers();
    
    // Test product management with role-based access control
    await testAddProduct();
    
    console.log('\n' + '='.repeat(50));
    console.log('TESTS COMPLETED');
    console.log('='.repeat(50));
};

// Run the tests
runTests();
