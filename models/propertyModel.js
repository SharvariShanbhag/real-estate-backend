const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import the configured sequelize instance

const Property = sequelize.define('Property', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0 // Price cannot be negative
        }
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('For Rent', 'For Sale'),
        allowNull: false
    },
    image: {
        type: DataTypes.STRING(255), // Stores the filename of the uploaded image
        allowNull: false,
        // Removed unique: true from here. Filenames don't need to be unique across the entire table.
        // A property's ID is unique, not necessarily its image name globally.
    },
    size: {
        type: DataTypes.STRING(100), // e.g., "1500 sq ft" or "0.5 acres"
        allowNull: true
    },
    area: { // If this means land area, could be separate from 'size' which might be built-up area
        type: DataTypes.STRING(100),
        allowNull: true
    },
    bedroom: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0 // Cannot have negative bedrooms
        }
    },
    bathroom: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0
        }
    },
    garage: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            isInt: true,
            min: 1800, // Reasonable minimum year
            max: new Date().getFullYear() + 5 // Not too far in the future
        }
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    zip_code: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    city_area: { // More specific area within a city (e.g., "Koregaon Park")
        type: DataTypes.STRING(100),
        allowNull: true
    },
    state: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    country: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'India' // Default changed to India
    },
    interestedUsers: {
        type: DataTypes.JSON, // Stores an array of integers (user IDs)
        allowNull: true,
        defaultValue: []
    }
}, {
    tableName: 'Properties', // Explicit table name
    timestamps: true // createdAt and updatedAt fields
});

module.exports = Property;