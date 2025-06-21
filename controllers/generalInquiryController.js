// backend/controllers/generalInquiryController.js
const GeneralInquiry = require('../models/generalInquiryModel'); // Import the new model

// @desc    Submit a new general inquiry
// @route   POST /api/general-inquiries
// @access  Public (from InquiryForm1)
exports.submitGeneralInquiry = async (req, res) => {
  try {
    const { inquiryType, name, email, phone, message } = req.body;

    // Basic validation
    if (!inquiryType || !name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields: Inquiry Type, Name, Email, and Message.' });
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const newGeneralInquiry = await GeneralInquiry.create({
      inquiryType,
      name,
      email,
      phone: phone || null,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'General inquiry submitted successfully!',
      inquiry: newGeneralInquiry,
    });

  } catch (error) {
    console.error('Error submitting general inquiry:', error);
    // Handle specific Sequelize errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      // This might happen if you set email as unique for GeneralInquiry
      return res.status(409).json({ success: false, message: 'An inquiry from this email already exists in our general inquiries. We will get back to you shortly.', error: error.message });
    }
    if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        return res.status(400).json({ success: false, message: 'Validation error', errors });
    }
    res.status(500).json({ success: false, message: 'Server error during general inquiry submission.', error: error.message });
  }
};

// @desc    Get all general inquiries (Admin only)
// @route   GET /api/general-inquiries
// @access  Private (Admin)
exports.getAllGeneralInquiries = async (req, res) => {
    try {
        const inquiries = await GeneralInquiry.findAll();
        res.status(200).json({ success: true, data: inquiries });
    } catch (error) {
        console.error('Error fetching general inquiries:', error);
        res.status(500).json({ success: false, message: 'Server error fetching general inquiries.', error: error.message });
    }
};

// Add other CRUD operations as needed (get by ID, delete etc.)