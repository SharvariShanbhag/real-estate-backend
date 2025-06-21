// backend/models/index.js
const sequelize = require('../config/db'); // Your Sequelize instance

// Import your existing models
const Property = require('./propertyModel');
const User = require('./userModel');
const Inquiry = require('./inquiryModel'); // This is likely for property-specific inquiries

// Import the new GeneralInquiry model
const GeneralInquiry = require('./generalInquiryModel'); // <-- NEW: Import the GeneralInquiry model

// Define Associations for existing models (as you had them)
// User and Inquiry: A User can submit many inquiries (property-specific)
User.hasMany(Inquiry, {
  foreignKey: 'userId',
  as: 'inquiries',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Inquiry.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Property and Inquiry: A Property can have many inquiries (property-specific)
Property.hasMany(Inquiry, {
  foreignKey: 'propertyId',
  as: 'inquiries',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Inquiry.belongsTo(Property, {
  foreignKey: 'propertyId',
  as: 'property'
});

// --- NEW: Associations for GeneralInquiry (Optional) ---
// If you want to link a GeneralInquiry to a User (e.g., if a logged-in user fills InquiryForm1)
// User.hasMany(GeneralInquiry, {
//   foreignKey: 'userId',
//   as: 'generalInquiries', // Alias for when you include GeneralInquiries through User
//   onDelete: 'SET NULL',
//   onUpdate: 'CASCADE'
// });
// GeneralInquiry.belongsTo(User, {
//   foreignKey: 'userId',
//   as: 'user' // Alias for when you include User through GeneralInquiry
// });

// Export all models
module.exports = {
  sequelize, // Export sequelize instance itself
  Property,
  User,
  Inquiry,
  GeneralInquiry, // <-- NEW: Export the GeneralInquiry model
};