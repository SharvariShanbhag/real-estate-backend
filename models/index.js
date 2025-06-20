// backend/models/index.js
const sequelize = require('../config/db'); // Your Sequelize instance
const Property = require('./propertyModel');
const User = require('./userModel'); // Assuming you have a User model at ./User.js
const Inquiry = require('./inquiryModel'); // The new Inquiry model

// Define Associations
// User and Inquiry: A User can submit many inquiries
User.hasMany(Inquiry, {
  foreignKey: 'userId', // The column in the Inquiry table that links to the User
  as: 'inquiries',     // Alias for when you include Inquiries through User
  onDelete: 'SET NULL', // If a user is deleted, set their inquiries' userId to NULL
  onUpdate: 'CASCADE'
});
Inquiry.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user' // Alias for when you include User through Inquiry
});

// Property and Inquiry: A Property can have many inquiries
Property.hasMany(Inquiry, {
  foreignKey: 'propertyId', // The column in the Inquiry table that links to the Property
  as: 'inquiries',          // Alias for when you include Inquiries through Property
  onDelete: 'CASCADE',      // If a property is deleted, delete its associated inquiries
  onUpdate: 'CASCADE'
});
Inquiry.belongsTo(Property, {
  foreignKey: 'propertyId',
  as: 'property' // Alias for when you include Property through Inquiry
});

// Export all models
module.exports = {
  sequelize, // Export sequelize instance itself
  Property,
  User,
  Inquiry,
};