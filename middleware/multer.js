const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Node.js File System module

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads'); // Points to /real-estate-backend/uploads
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Create if it doesn't exist
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Use the absolute path
    },
    filename: (req, file, cb) => {
        // Generate a unique filename using timestamp and original extension
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true, false); // Accept the file
    } else {
        cb(new Error('Invalid file type. Only PNG, JPEG, and JPG image files are allowed.'), false); // Reject file
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB file size limit
    }
});

module.exports = upload;