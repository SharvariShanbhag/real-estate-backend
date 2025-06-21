// // backend/server.js

// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// require('dotenv').config(); // Load environment variables from .env file

// // --- Database Connection and Model Associations ---
// // IMPORTANT: Ensure your config/db.js connects to the database (e.g., sequelize.authenticate())
// // AND that your models/index.js (if you have one) sets up all Sequelize model associations
// // (e.g., User.hasMany(Inquiry), Inquiry.belongsTo(User), etc.).
// // By just requiring './models', you ensure the association logic runs.
// require('./config/db'); // This should establish the DB connection
// require('./models');    // This should define models and their associations

// // --- Route Imports ---
// const userRoute = require('./routes/userRoute');       // Example: /api/users
// const propertyRoute = require('./routes/propertyRoute'); // Example: /api/properties
// const inquiryRoute = require('./routes/inquiryRoute'); // Example: /api/inquiries
// const authRoutes = require('./routes/authRoutes');     // IMPORTANT: Your authentication routes (e.g., /api/auth/register, /api/auth/login)

// const app = express();
// const port = process.env.PORT || 8000;

// // --- Middleware ---
// app.use(express.json()); // Middleware to parse JSON request bodies
// // Configure CORS for specific origins and allowed methods/headers
// app.use(cors({
//     origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'], // Your React app's URLs
//     methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
//     allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers including Authorization for tokens
//     credentials: true // Allow sending cookies/auth headers from client
// }));

// // Serve static files (e.g., images from the 'uploads' directory)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // --- Test Route ---
// app.get('/', (req, res) => res.send('Hello World from Backend!'));

// // --- API Routes ---
// // Mount your routers at their respective base paths
// app.use('/api/users', userRoute);
// app.use('/api/properties', propertyRoute);
// app.use('/api/inquiries', inquiryRoute);
// app.use('/api/auth', authRoutes); // <-- CRITICAL: This line makes your /api/auth routes accessible!

// // --- Error Handling Middleware (Optional but Recommended) ---
// // Catch 404 and forward to error handler
// app.use((req, res, next) => {
//     const error = new Error('Not Found');
//     error.status = 404;
//     next(error);
// });

// // General error handler
// app.use((error, req, res, next) => {
//     res.status(error.status || 500);
//     res.json({
//         error: {
//             message: error.message,
//             // Optionally, include stack trace in development
//             // stack: process.env.NODE_ENV === 'production' ? null : error.stack
//         }
//     });
// });

// // --- Start Server ---
// // Assumes that database authentication and synchronization are handled
// // within './config/db.js' or './models/index.js'
// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// --- Database Connection and Model Associations ---
// Your existing setup should handle this. Make sure generalInquiryModel.js is loaded.
require('./config/db');
require('./models'); // This should now also load GeneralInquiry if your index.js is set up

// --- Route Imports ---
const userRoute = require('./routes/userRoute');
const propertyRoute = require('./routes/propertyRoute');
const inquiryRoute = require('./routes/inquiryRoute'); // For existing property-related inquiries
const generalInquiryRoute = require('./routes/generalInquiryRoute'); // <-- NEW: Import the new route
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = process.env.PORT || 8000;

// --- Middleware ---
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Test Route ---
app.get('/', (req, res) => res.send('Hello World from Backend!'));

// --- API Routes ---
app.use('/api/users', userRoute);
app.use('/api/properties', propertyRoute);
app.use('/api/inquiries', inquiryRoute); // Existing property-related inquiries
app.use('/api/general-inquiries', generalInquiryRoute); // <-- NEW: Mount the new route
app.use('/api/auth', authRoutes);

// --- Error Handling Middleware ---
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        }
    });
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});