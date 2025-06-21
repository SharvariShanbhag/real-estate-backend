
// backend/routes/generalInquiryRoute.js
const express = require('express');
const { submitGeneralInquiry, getAllGeneralInquiries } = require('../controllers/generalInquiryController');
const { auth, isAdmin } = require('../middleware/auth'); // Assuming you want admin protection for fetching all

const router = express.Router();

// Public route for submitting general inquiries from InquiryForm1
router.post('/', submitGeneralInquiry);

// Protected route for getting all general inquiries (admin only)
router.get('/', auth, isAdmin, getAllGeneralInquiries);

module.exports = router;