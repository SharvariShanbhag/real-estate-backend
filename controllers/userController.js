// controllers/userController.js

const User = require('../models/userModel'); // Correct path to your Sequelize User model
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Ensure dotenv is configured if you're using process.env.JWT_SECRET

// --- Register a new user ---
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body; // 'role' might be sent by admin for new admin users

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists.'
            });
        }

        // Determine the role for the new user.
        // For new registrations, it's safer to default to 'user' unless you have
        // a specific admin-only registration mechanism that explicitly sets 'admin' role.
        const userRole = (role === 'admin') ? 'admin' : 'user'; // Ensure it's 'admin' or 'user' enum value

        const newUser = await User.create({
            name,
            email,
            password, // Hashing happens via the Sequelize hook
            role: userRole // Set the determined role
        });

        // Generate JWT token with necessary payload (id, role for isAdmin check)
        const token = jwt.sign(
            { id: newUser.id, role: newUser.role }, // Payload for the token
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } // Use environment variable or default
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully!',
            token,
            user: { // Send user object with isAdmin for frontend context
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role, // Keep original role
                isAdmin: newUser.role === 'admin' // Calculate isAdmin for frontend
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            return res.status(400).json({ success: false, message: 'Validation failed', details: errors });
        }
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.',
            error: error.message
        });
    }
};

// --- Login user ---
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials: User not found.'
            });
        }

        // Use the instance method for password comparison
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials: Incorrect password.'
            });
        }

        // --- DEBUGGING LOGS FOR LOGIN ---
        console.log("LOGIN: User object from DB:", user.toJSON()); // Use toJSON() for plain object
        console.log("LOGIN: User role from DB:", user.role);
        console.log("LOGIN: Calculated isAdmin for token/response:", user.role === 'admin');
        // --- END DEBUGGING LOGS ---

        // Generate JWT token with necessary payload (id, role)
        const token = jwt.sign(
            { id: user.id, role: user.role }, // Payload for the token
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            token,
            user: { // Send user object with isAdmin for frontend context
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role, // Keep original role
                isAdmin: user.role === 'admin' // Calculate isAdmin for frontend
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.',
            error: error.message
        });
    }
};

// --- Get user info (requires authentication via auth middleware) ---
const getUserInfo = async (req, res) => {
    // The 'auth' middleware should have populated req.user with the decoded JWT payload.
    // The payload should contain { id: user.id, role: user.role }.
    if (!req.user || !req.user.id) { // Ensure 'id' is present from token
        return res.status(401).json({ success: false, message: 'Unauthorized: User ID not found in token.' });
    }

    try {
        // Fetch the user from the database using the ID provided by the token
        const user = await User.findByPk(req.user.id, { // Use req.user.id as per your JWT payload
            attributes: ['id', 'name', 'email', 'role'] // Select specific non-sensitive attributes
        });

        if (!user) {
            // This case indicates a valid token but user not found in DB (e.g., deleted after token issued)
            return res.status(404).json({ success: false, message: 'User profile not found.' });
        }

        // --- DEBUGGING LOGS FOR GET_USER_INFO ---
        console.log("GET_USER_INFO: User object from DB:", user.toJSON()); // Use toJSON()
        console.log("GET_USER_INFO: User role from DB:", user.role);
        console.log("GET_USER_INFO: Type of user.role:", typeof user.role);
        console.log("GET_USER_INFO: Comparison 'user.role === 'admin'' result:", user.role === 'admin');
        // --- END DEBUGGING LOGS ---

        res.status(200).json({
            success: true,
            message: 'User info fetched successfully.',
            user: { // Send user object with isAdmin for frontend context
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role, // Keep original role
                isAdmin: user.role === 'admin' // Calculate isAdmin for frontend
            }
        });
    } catch (error) {
        console.error('Get user info error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user info.', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserInfo
};