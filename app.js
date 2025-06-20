// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// require('dotenv').config();
// require('./config/db'); // Sequelize DB connection

// // Route Imports
// const userRoute = require('./routes/userRoute');
// const propertyRoute = require('./routes/propertyRoute');

// const app = express();
// const port = process.env.PORT || 8000;

// // Middleware
// app.use(express.json());
// // app.use(cors());
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],// Your React app's URL
//    methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

// // Serve static files (e.g., images from /uploads)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  

// // Test route
// app.get('/', (req, res) => res.send('Hello World!'));

// // API Routes
// app.use('/api/users', userRoute);
// app.use('/api/properties', propertyRoute); 

// // Start server
// app.listen(port, () => console.log(`Server running on port ${port}`));

// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// IMPORTANT: Ensure this line correctly imports and initializes your Sequelize models and associations.
// If you created a models/index.js, require that. Otherwise, ensure all models are required here
// and associations are defined immediately after.
const sequelize = require('./config/db'); // Your database connection instance
// const { Property, User, Inquiry } = require('./models'); // If you have models/index.js exporting them

// If you have models/index.js to set up associations, ensure it's required:
require('./models'); // This will run the associations defined in index.js

// Route Imports
const userRoute = require('./routes/userRoute');
const propertyRoute = require('./routes/propertyRoute');
const inquiryRoute = require('./routes/inquiryRoute'); // <-- NEW: Import your inquiry routes

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'], // Your React app's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Serve static files (e.g., images from /uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/', (req, res) => res.send('Hello World!'));

// API Routes
app.use('/api/users', userRoute);
app.use('/api/properties', propertyRoute);
app.use('/api/inquiries', inquiryRoute); // <-- NEW: Use your inquiry routes

// Start server
// Your config/db.js already calls `sequelize.authenticate()` and `sequelize.sync()`.
// So, you don't need to duplicate that here. Just start the server after that process
// in config/db.js is implicitly done.
app.listen(port, () => console.log(`Server running on port ${port}`));