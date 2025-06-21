// // backend/routes/inquiryRoute.js
// const express = require('express');
// const inquiryController = require('../controllers/inquiryController');
// const { auth } = require('../middleware/auth');

// const router = express.Router();

// // 1. POST route (won't conflict with GETs)
// router.post('/submit', inquiryController.submitInquiry);

// // === CRITICAL ORDERING FOR GET ROUTES ===

// // 2. More specific static paths first
// router.get('/byUser', auth, inquiryController.getInquiriesByUser); // MUST BE BEFORE /:id
// router.get('/byProperty/:propertyId', inquiryController.getInquiriesByProperty); // MUST BE BEFORE /:id

// // 3. General "all" route
// router.get('/', auth, inquiryController.getAllInquiries); // This should be before /:id as well if you want it to catch '/api/inquiries'

// // 4. Most general parameterized path LAST
// router.get('/:id', inquiryController.getInquiryById); // This will catch anything else after /api/inquiries/

// module.exports = router;

// backend/routes/inquiryRoute.js
const express = require('express');
const inquiryController = require('../controllers/inquiryController');
const { auth } = require('../middleware/auth'); // Assuming your auth middleware is here

const router = express.Router();

// 1. POST route for submitting inquiries (requires auth)
router.post('/submit', auth, inquiryController.submitInquiry); // Added 'auth' middleware here

// === CRITICAL ORDERING FOR GET ROUTES ===
// Ensure more specific routes come before general ones

// 2. More specific static paths first
router.get('/byUser', auth, inquiryController.getInquiriesByUser);
router.get('/byProperty/:propertyId', inquiryController.getInquiriesByProperty);

// 3. General "all" route (requires auth if you want to restrict who can see all inquiries)
router.get('/', auth, inquiryController.getAllInquiries); // Assuming you want this protected

// 4. Most general parameterized path LAST
router.get('/:id', inquiryController.getInquiryById);

module.exports = router;