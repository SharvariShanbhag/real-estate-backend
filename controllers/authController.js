// backend/controllers/authController.js
const { User } = require('../models'); // Assuming your User model is correctly exported via models/index.js
const jwt = require('jsonwebtoken');   // For generating JWT tokens
const dotenv = require('dotenv');       // To load environment variables

dotenv.config(); // Load .env variables

// --- Register a new user ---
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        // Check if user already exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        // Create user (password hashing is handled by the User model's beforeCreate hook)
        user = await User.create({
            name,
            email,
            password,
            // Only include 'phone' here if your User model and database table *actually* have a 'phone' column.
            // If you chose Option 1 (not having phone for users), you should probably remove phone from here too
            // OR ensure your User model allows phone to be null if it's passed but not stored.
            phone: phone || null // Phone is optional for registration payload
        });

        // Optionally, generate a token and send it back immediately after registration
        // If you want to auto-login the user after registration, uncomment the JWT part.
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // IMPORTANT: Only return 'phone' in the user object if your User model and DB table actually have it.
        // If not, remove it from this response as well to be consistent.
        res.status(201).json({
            message: 'User registered successfully!',
            token, // Send token back for auto-login
            user: { id: user.id, name: user.name, email: user.email, role: user.role } // Removed phone for consistency with getMe/login if not in DB
        });

    } catch (error) {
        console.error('Registration error:', error);
        // Check for specific Sequelize errors if needed, e.g., validation errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Email already registered.' });
        }
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: error.errors[0].message || 'Validation error.' });
        }
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
};

// --- Login a user ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // 1. Find the user by email
        const user = await User.findOne({
            where: { email },
            // FIX: Explicitly list attributes and EXCLUDE 'phone' here
            // This prevents Sequelize from trying to select a non-existent 'phone' column.
            attributes: ['id', 'name', 'email', 'password', 'role']
        });

        if (!user) {
            // Important: Use a generic message for security to prevent username enumeration
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // 2. Compare the provided plaintext password with the hashed password using the instance method
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            // Password does not match
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // 3. If credentials are valid, generate and send a JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role }, // Include user ID and role in the token payload
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.status(200).json({
            message: 'Logged in successfully!',
            token, // Send token to the client
            // FIX: Only send 'phone' in the user object if your User model and DB table actually have it.
            // If you are sticking with "Option 1" (no phone in DB), remove it here.
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
};

// --- Get authenticated user's details ---
// This route will be protected by your 'auth' middleware,
// which populates req.user.id based on the JWT.
exports.getMe = async (req, res) => {
    try {
        // req.user is populated by the 'auth' middleware
        const user = await User.findByPk(req.user.id, {
            // FIX: Ensure 'phone' is removed from attributes here
            attributes: ['id', 'name', 'email', 'role'] // Select specific attributes to return
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};