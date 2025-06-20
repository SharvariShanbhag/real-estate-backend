const Property = require('../models/propertyModel');
const { Op } = require('sequelize'); // Make sure you import Op for search
const fs = require('fs');
const path = require('path');

const UPLOAD_FOLDER = 'uploads'; // Adjust if your upload folder name is different

// Helper for detailed error logging
const logError = (context, error) => {
    console.error(`\n--- [PropertyController - ${context}] START ERROR ---`);
    console.error(`Error Message: ${error.message}`);
    if (error.name) console.error(`Error Name: ${error.name}`);
    if (error.errors) { // Sequelize validation errors details
        console.error("Sequelize Validation Errors:");
        error.errors.forEach(err => console.error(`  - Path: ${err.path}, Value: ${err.value}, Message: ${err.message}`));
    }
    console.error(`Stack Trace:`, error.stack);
    console.error(`--- [PropertyController - ${context}] END ERROR ---\n`);
};

// --- Get all properties (with filtering, pagination, and sorting) ---
const getAllProperties = async (req, res) => {
    try {
        // --- DEBUGGING: Log incoming query parameters ---
        console.log("Backend: getAllProperties - Received Query:", req.query);

        const { type, location, bedrooms, minPrice, maxPrice, limit = 9, offset = 0 } = req.query;
        const whereClause = {};

        if (type && type !== 'ALL_UNITS') { // Only apply type filter if not 'ALL_UNITS'
            whereClause.type = type;
        }

        if (location) {
            whereClause[Op.or] = [
                { city: { [Op.like]: `%${location}%` } },
                { address: { [Op.like]: `%${location}%` } },
                { city_area: { [Op.like]: `%${location}%` } },
                { state: { [Op.like]: `%${location}%` } },
                { country: { [Op.like]: `%${location}%` } }
            ];
        }

        if (bedrooms) {
            const numBedrooms = parseInt(bedrooms, 10);
            if (!isNaN(numBedrooms)) {
                if (numBedrooms === 3) { // Special handling for '3+' (e.g., if dropdown value is '3')
                    whereClause.bedroom = { [Op.gte]: 3 };
                } else if (numBedrooms > 0) {
                    whereClause.bedroom = numBedrooms;
                }
            }
        }

        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) {
                const parsedMinPrice = parseFloat(minPrice);
                if (!isNaN(parsedMinPrice)) {
                    whereClause.price[Op.gte] = parsedMinPrice;
                }
            }
            if (maxPrice) {
                const parsedMaxPrice = parseFloat(maxPrice);
                if (!isNaN(parsedMaxPrice)) {
                    whereClause.price[Op.lte] = parsedMaxPrice;
                }
            }
        }

        const parsedLimit = parseInt(limit, 10);
        const parsedOffset = parseInt(offset, 10);

        // --- DEBUGGING: Log final whereClause and pagination ---
        console.log("Backend: getAllProperties - Final Where Clause:", whereClause);
        console.log("Backend: getAllProperties - Limit:", parsedLimit, "Offset:", parsedOffset);


        const { count, rows: properties } = await Property.findAndCountAll({
            where: whereClause,
            limit: parsedLimit,
            offset: parsedOffset,
            order: [['createdAt', 'DESC']] // Order by creation date, newest first
        });

        res.status(200).json({
            success: true,
            totalProperties: count,
            properties,
            currentPage: Math.floor(parsedOffset / parsedLimit),
            totalPages: Math.ceil(count / parsedLimit)
        });
    } catch (error) {
        logError('getAllProperties', error);
        res.status(500).json({ success: false, error: 'Failed to fetch properties', details: error.message });
    }
};

// --- Get property by ID ---
const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findByPk(id);

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        res.status(200).json({ success: true, property });
    } catch (error) {
        logError('getPropertyById', error);
        res.status(500).json({ success: false, error: 'Failed to get property', details: error.message });
    }
};

// --- Create a new property ---
const createProperty = async (req, res) => {
    try {
        console.log("\n--- [createProperty] Incoming Request Data ---");
        console.log("Req Body:", req.body);
        console.log("Req File:", req.file);
        console.log("--- End Incoming Request Data ---\n");

        const {
            title, price, city, description, type, size, area,
            bedroom, bathroom, garage, year, address, zip_code,
            city_area, state, country
        } = req.body;

        const image = req.file?.filename;

        // Validation for image presence
        if (!image) {
            console.log("[createProperty] Image file is missing or Multer failed.");
            return res.status(400).json({ success: false, message: 'Image is required or upload failed. Ensure "image" field is sent and Multer is configured correctly.' });
        }

        // Validation for critical text fields
        if (!title || !price || !city || !type || !address) {
            console.log("[createProperty] Missing one or more critical text fields.");
            // Clean up uploaded image if validation fails
            if (image) {
                const imagePath = path.join(__dirname, '..', UPLOAD_FOLDER, image);
                if (fs.existsSync(imagePath)) {
                    fs.unlink(imagePath, (err) => {
                        if (err) console.error("Error deleting orphaned image file (missing fields):", err);
                    });
                }
            }
            return res.status(400).json({
                success: false,
                message: 'Missing required property details: title, price, city, type, or address.'
            });
        }

        // Parse and validate numeric fields
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            // Clean up image and return error for invalid price
            if (image) {
                const imagePath = path.join(__dirname, '..', UPLOAD_FOLDER, image);
                if (fs.existsSync(imagePath)) {
                    fs.unlink(imagePath, (err) => {
                        if (err) console.error("Error deleting orphaned image file (invalid price):", err);
                    });
                }
            }
            return res.status(400).json({ success: false, message: 'Price must be a valid positive number.' });
        }

        let parsedGarage = parseInt(garage, 10);
        if (isNaN(parsedGarage) || parsedGarage < 0) {
            console.warn(`[createProperty] Invalid garage value received: '${garage}'. Setting to 0.`);
            parsedGarage = 0; // Default to 0 if invalid or negative
        }

        const parsedSize = size ? parseInt(size, 10) : null;
        if (size && (isNaN(parsedSize) || parsedSize < 0)) {
            console.warn(`[createProperty] Invalid size value received: '${size}'. Setting to null.`);
            // You might choose to set to 0, null, or return an error based on your requirements
        }

        const parsedBedroom = bedroom ? parseInt(bedroom, 10) : 0; // Default to 0 if not provided or invalid
        if (bedroom && (isNaN(parsedBedroom) || parsedBedroom < 0)) {
            console.warn(`[createProperty] Invalid bedroom value received: '${bedroom}'. Setting to 0.`);
        }

        const parsedBathroom = bathroom ? parseInt(bathroom, 10) : 0; // Default to 0 if not provided or invalid
        if (bathroom && (isNaN(parsedBathroom) || parsedBathroom < 0)) {
            console.warn(`[createProperty] Invalid bathroom value received: '${bathroom}'. Setting to 0.`);
        }

        const parsedYear = year ? parseInt(year, 10) : null;
        if (year && (isNaN(parsedYear) || parsedYear < 1000 || parsedYear > new Date().getFullYear() + 5)) { // Basic year validation
            console.warn(`[createProperty] Invalid year value received: '${year}'. Setting to null.`);
            // You might want to handle this as an error too
        }

        // Create the property in the database
        const newProperty = await Property.create({
            title,
            price: parsedPrice, // Use the parsed price
            city,
            description,
            type,
            image, // This is the filename saved by Multer
            size: parsedSize, // Use parsed size
            area,
            bedroom: parsedBedroom, // Use parsed bedroom
            bathroom: parsedBathroom, // Use parsed bathroom
            garage: parsedGarage, // Use the parsed, validated garage value
            year: parsedYear, // Use parsed year
            address,
            zip_code,
            city_area,
            state,
            country,
            // interestedUsers field is often handled differently, perhaps defaulting in model
            // or explicitly set to an empty array if your model expects it.
            // If interestedUsers is a JSON field, ensure it's handled as an array.
            interestedUsers: [], // Initialize as an empty array for new properties
        });

        res.status(201).json({
            success: true,
            message: "Property created successfully!",
            property: newProperty
        });

    } catch (error) {
        logError('createProperty', error); // Use helper for detailed logging

        // If an image was uploaded before the database error, clean it up
        if (req.file && req.file.filename) {
            const imagePath = path.join(__dirname, '..', UPLOAD_FOLDER, req.file.filename);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (unlinkErr) => {
                    if (unlinkErr) console.error("Error deleting orphaned image after DB error:", unlinkErr);
                });
            }
        }

        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.join(', ') // Join validation error messages
            });
        }
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                success: false,
                error: 'Conflict',
                details: 'A record with this unique value already exists.' // More general message
            });
        }
        res.status(500).json({ success: false, error: 'Failed to create property', details: error.message });
    }
};

// --- Update property ---
const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findByPk(id);

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        // Prepare update data, parsing numeric fields if they are in req.body
        const updateData = { ...req.body };

        if (updateData.price) updateData.price = parseFloat(updateData.price);
        if (updateData.size) updateData.size = parseInt(updateData.size, 10);
        if (updateData.bedroom) updateData.bedroom = parseInt(updateData.bedroom, 10);
        if (updateData.bathroom) updateData.bathroom = parseInt(updateData.bathroom, 10);

        if (updateData.garage) {
            let parsedGarage = parseInt(updateData.garage, 10);
            if (isNaN(parsedGarage) || parsedGarage < 0) {
                console.warn(`[updateProperty] Invalid garage value received: '${updateData.garage}'. Setting to 0.`);
                parsedGarage = 0;
            }
            updateData.garage = parsedGarage;
        }

        if (updateData.year) updateData.year = parseInt(updateData.year, 10);

        // If a new image file is uploaded
        if (req.file) {
            // Delete old image file from server to prevent clutter
            if (property.image) {
                const oldImagePath = path.join(__dirname, '..', UPLOAD_FOLDER, property.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error("Failed to delete old image file:", oldImagePath, err);
                    });
                }
            }
            updateData.image = req.file.filename; // Update with new filename
        }

        const updatedProperty = await property.update(updateData);

        res.status(200).json({ success: true, message: 'Property updated successfully', property: updatedProperty });
    } catch (error) {
        logError('updateProperty', error);
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            return res.status(400).json({ success: false, message: 'Validation failed', details: errors.join(', ') });
        }
        res.status(500).json({ success: false, error: 'Failed to update property', details: error.message });
    }
};

// --- Delete property ---
const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        const property = await Property.findByPk(id);

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        // Delete the associated image file from the 'uploads' folder
        if (property.image) {
            const imagePath = path.join(__dirname, '..', UPLOAD_FOLDER, property.image);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) console.error("Failed to delete image file:", imagePath, err);
                });
            }
        }

        await property.destroy();
        res.status(200).json({ success: true, message: 'Property deleted successfully' });

    } catch (error) {
        logError('deleteProperty', error);
        res.status(500).json({ success: false, error: 'Failed to delete property', details: error.message });
    }
};

// --- Search properties ---
const searchProperties = async (req, res) => {
    try {
        const { query } = req.query; // Search term from query parameter (e.g., ?query=pune)

        if (!query) {
            return res.status(400).json({ success: false, message: "Search query is required." });
        }

        const properties = await Property.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.like]: `%${query}%` } },
                    { city: { [Op.like]: `%${query}%` } },
                    { description: { [Op.like]: `%${query}%` } },
                    { address: { [Op.like]: `%${query}%` } },
                    { city_area: { [Op.like]: `%${query}%` } },
                    { state: { [Op.like]: `%${query}%` } },
                    { country: { [Op.like]: `%${query}%` } }
                ]
            }
        });

        res.status(200).json({ success: true, properties });
    } catch (error) {
        logError('searchProperties', error);
        res.status(500).json({ success: false, error: 'Search failed', details: error.message });
    }
};

// --- Add/Update interested user (adds userId to interestedUsers array) ---
const addUpdateInterestedUser = async (req, res) => {
    try {
        const { id } = req.params; // Property ID
        // req.user is set by your auth middleware (ensure it's used on this route)
        // If req.user is not guaranteed to exist due to middleware setup, add a check here.
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Authentication required to show interest.' });
        }
        const userId = req.user.id;

        const property = await Property.findByPk(id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        let interestedUsers = property.interestedUsers || [];
        // Ensure it's an array and contains only unique user IDs
        if (!Array.isArray(interestedUsers)) {
            try {
                // Try to parse if it's a stringified JSON array
                interestedUsers = JSON.parse(interestedUsers);
                if (!Array.isArray(interestedUsers)) {
                    interestedUsers = []; // If parsing fails or results in non-array
                }
            } catch (e) {
                console.error("Failed to parse interestedUsers, resetting to empty array:", e);
                interestedUsers = [];
            }
        }

        // Convert existing IDs to numbers to ensure type consistency
        interestedUsers = interestedUsers.map(Number);

        if (!interestedUsers.includes(userId)) {
            interestedUsers.push(userId);
            // Update the interestedUsers array in the DB
            await property.update({ interestedUsers });
            res.status(200).json({ success: true, message: 'User marked as interested.', interestedUsers });
        } else {
            return res.status(200).json({ success: true, message: 'User already marked as interested.', interestedUsers });
        }

    } catch (error) {
        logError('addUpdateInterestedUser', error);
        res.status(500).json({ success: false, error: 'Failed to update interested user', details: error.message });
    }
};

module.exports = {
    getAllProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    searchProperties,
    addUpdateInterestedUser
};