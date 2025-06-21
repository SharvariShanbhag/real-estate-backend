// backend/middleware/auth.js

const jwt = require('jsonwebtoken');
require("dotenv").config(); // Ensure dotenv is loaded
const User = require('../models/userModel'); // Correct path to your User model

const auth = async (req, res, next) => {
    try {
        const tokenBearer = req.headers.authorization;

        if (!tokenBearer || !tokenBearer.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed: No token provided or invalid format."
            });
        }

        const token = tokenBearer.split(' ')[1];

        // Verify the token - decoded will contain { id: user.id, role: user.role } from JWT payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user from DB to ensure they still exist and get up-to-date role/info
        // FIX: Explicitly specify attributes to select, excluding 'phone' if it causes issues
        const user = await User.findByPk(decoded.id, {
            attributes: ['id', 'name', 'email', 'role'] // Exclude 'phone' here (or any other problematic columns)
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed: User not found in database." // More specific message
            });
        }

        // Attach the fetched user object (without 'phone' if excluded) to the request
        req.user = user;
        next(); // Proceed to the next middleware or route handler

    } catch (error) {
        // Log the specific error name for better debugging
        console.error("Auth middleware error:", error.name, error.message);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: "Invalid token." });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
        }
        // Catch any other unexpected errors during the process
        res.status(500).json({ success: false, message: "Server error during authentication.", error: error.message });
    }
};

const isAdmin = (req, res, next) => {
    // Assuming req.user is reliably set by the 'auth' middleware and has a 'role' property
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: "Authorization failed: Admin access required."
        });
    }
};

module.exports = { auth, isAdmin };