// // backend/models/Inquiry.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db'); // Your database connection instance

// const Inquiry = sequelize.define('Inquiry', {
//     id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true
//     },
//     name: {
//         type: DataTypes.STRING(100),
//         allowNull: false
//     },
//     email: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//         validate: {
//             isEmail: true
//         }
//     },
//     phone: {
//         type: DataTypes.STRING(20),
//         allowNull: false
//     },
//     message: {
//         type: DataTypes.TEXT,
//         allowNull: false
//     },
//     inquiryType: {
//         type: DataTypes.ENUM('Property-Specific', 'General'), // As used in your controller
//         allowNull: false,
//         defaultValue: 'General'
//     },
//     // Foreign Keys (will be associated in models/index.js or directly in server.js)
//     // userId: This column will be created by Sequelize automatically if you define the association correctly.
//     // propertyId: This column will be created by Sequelize automatically if you define the association correctly.
// }, {
//     tableName: 'Inquiries', // Explicit table name
//     timestamps: true // createdAt and updatedAt fields
// });

// module.exports = Inquiry;
// backend/models/Inquiry.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Your database connection instance

const Inquiry = sequelize.define('Inquiry', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        // required:false,
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    inquiryType: {
        type: DataTypes.ENUM('Property-Specific', 'General'),
        allowNull: false,
        defaultValue: 'General'
    },
    // userId: This column will be created by Sequelize automatically if you define the association correctly.
    // propertyId: This column will be created by Sequelize automatically if you define the association correctly.
}, {
    tableName: 'Inquiries',
    timestamps: true
});

module.exports = Inquiry;