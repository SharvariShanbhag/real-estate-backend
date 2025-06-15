const express = require('express');
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.LoginUser);
router.get('/getUserInfo', auth, userController.getUserInfo); // ✅ FIXED: use auth middleware correctly

module.exports = router;