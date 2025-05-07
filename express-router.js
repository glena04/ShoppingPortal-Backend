// express-router.js
// This file explicitly exports Express's Router to avoid confusion with standalone router package

const express = require('express');

// Only export the Express Router, not the standalone router
module.exports = express.Router;

console.log('Express Router export wrapper initialized');