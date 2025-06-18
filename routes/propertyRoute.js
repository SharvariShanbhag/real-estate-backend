const express = require('express');
const propertyController = require('../controllers/propertyController');
const { auth, isAdmin } = require('../middleware/auth'); // Import auth and isAdmin
const upload = require('../middleware/multer'); // Import your configured multer middleware

const router = express.Router();

// Public routes (no authentication required)
router.get('/', propertyController.getAllProperties); // Changed to root for clarity
router.get('/:id', propertyController.getPropertyById); // Changed to root for clarity
router.get('/search', propertyController.searchProperties);

// Authenticated routes (requires valid JWT)
router.put('/:id/interested', auth, propertyController.addUpdateInterestedUser); // Use the renamed function

// Admin-only routes (requires admin role and valid JWT)
router.post('/createProperty', 
    auth,
     upload.single('image'), propertyController.createProperty); // Correct usage of multer
router.put('/:id', auth, isAdmin, upload.single('image'), propertyController.updateProperty); // Allow image update
router.delete('/:id', auth, isAdmin, propertyController.deleteProperty);

module.exports = router;