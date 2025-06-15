const Property = require('../models/propertyModel');
const User = require('../models/userModel');
const { Op } = require('sequelize');

// Get all properties
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.findAll();
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch properties', details: error.message });
  }
};

// Get property by ID
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id);

    if (!property) return res.status(404).json({ message: 'Property not found' });

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get property', details: error.message });
  }
};

// Create a new property
const createProperty = async (req, res) => {
  try {
    const {
      title, price, city, description, type, size, area,
      bedroom, bathroom, garage, year, address, zip_code,
      city_area, state, country
    } = req.body;

    const image = req.file?.filename;

    if (!image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const newProperty = await Property.create({
      title,
      price,
      city,
      description,
      type,
      image,
      size,
      area,
      bedroom,
      bathroom,
      garage,
      year,
      address,
      zip_code,
      city_area,
      state,
      country
    });

    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create property', details: error.message });
  }
};

// Update property
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id);

    if (!property) return res.status(404).json({ message: 'Property not found' });

    await property.update(req.body);
    res.status(200).json({ message: 'Property updated successfully', property });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update property', details: error.message });
  }
};

// Delete property
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id);

    if (!property) return res.status(404).json({ message: 'Property not found' });

    await property.destroy();
    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete property', details: error.message });
  }
};

// Search properties
const searchProperties = async (req, res) => {
  try {
    const { query } = req.query;

    const properties = await Property.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { city: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } }
        ]
      }
    });

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
};

// Add/Update interested user (as array of integers)
const AddUpdateIntrestedUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const property = await Property.findByPk(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    let interestedUsers = property.interestedUsers || [];
    if (!interestedUsers.includes(userId)) {
      interestedUsers.push(userId);
      await property.update({ interestedUsers });
    }

    res.status(200).json({ message: 'User marked as interested', interestedUsers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update interested user', details: error.message });
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
  AddUpdateIntrestedUser
};