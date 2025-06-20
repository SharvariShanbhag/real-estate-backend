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
    type: { // This is the 'For Rent' / 'For Sale' field
        type: DataTypes.ENUM('For Rent', 'For Sale'),
        allowNull: false
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    size: { // This is the size field, which is a STRING (e.g., "1500 sq ft")
        type: DataTypes.STRING(100),
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
            min: 0
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
            min: 1800,
            max: new Date().getFullYear() + 5
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
    city_area: { // This is the specific area within a city (e.g., "Koregaon Park")
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
        defaultValue: 'India'
    },
    interestedUsers: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    }
}, {
    tableName: 'Properties',
    timestamps: true
});

module.exports = Property;