// middleware/auth.js

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
        // This is crucial for roles that might change after token issuance.
        const user = await User.findByPk(decoded.id); // Use decoded.id from JWT payload
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed: User not found in database." // More specific message
            });
        }

        // Attach the full user object from the database to the request
        req.user = user; // req.user now contains { id, name, email, password, role, createdAt, updatedAt }
        next();

    } catch (error) {
        console.error("Auth middleware error:", error.message);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: "Invalid token." });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
        }
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