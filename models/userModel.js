const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import the configured sequelize instance
const bcrypt = require('bcryptjs'); // For password hashing/comparison

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true, // Email must be unique
        validate: {
            isEmail: true // Sequelize built-in validation for email format
        }
    },
    password: {
        type: DataTypes.STRING(100), // Store hashed password
        allowNull: false,
    },
    phone: { // Add this
        type: DataTypes.STRING, // Or INTEGER if you store it as a number
        allowNull: true, // Allow null if phone is optional for users
    },
    role: { // Using 'role' instead of 'isAdmin' for better scalability (e.g., 'user', 'admin')
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user',
        allowNull: false
    }
}, {
    tableName: 'users', // Good practice to use plural for table names
    timestamps: true, // createdAt and updatedAt
    hooks: {
        // Hash password before creating or updating a user
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) { // Only hash if password was actually changed
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

// Instance method for password comparison
User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;