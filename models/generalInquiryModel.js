// backend/models/generalInquiryModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Ensure this path is correct to your sequelize instance

const GeneralInquiry = sequelize.define('GeneralInquiry', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // The inquiryType field from the form, storing values like "Renting Property", "Buying Property", etc.
  inquiryType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Renting Property', 'Buying Property', 'Selling Property', 'Other']]
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    // Consider if you want emails to be unique for general inquiries.
    // If a user can submit multiple general inquiries over time, then `unique: true` might be too restrictive.
    // For general inquiries, it's often better to allow duplicates unless explicitly stated.
    // unique: true, // Uncomment if each email should only appear once in this table
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true, // Phone is optional
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // Sequelize automatically adds `createdAt` and `updatedAt`
}, {
  tableName: 'general_inquiries', // Explicitly set a different table name
  timestamps: true, // Ensures createdAt and updatedAt columns are added
});

module.exports = GeneralInquiry;