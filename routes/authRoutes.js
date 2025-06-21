// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Adjust path if needed
const { auth } = require('../middleware/auth'); // Your authentication middleware

// Register a new user
router.post('/register', authController.register);

// Login a user
router.post('/login', authController.login);

// Get authenticated user's info (protected route)
// This route will first pass through the 'auth' middleware
// If 'auth' middleware successfully validates the token, it calls next(),
// and then authController.getMe will execute.
router.get('/me', auth, authController.getMe); 

module.exports = router;