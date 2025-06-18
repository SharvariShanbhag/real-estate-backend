const express = require('express');
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth'); // Import auth middleware

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/me', auth, userController.getUserInfo); // Changed route to /me for user info

module.exports = router;