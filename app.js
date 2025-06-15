const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('./config/db'); // Sequelize DB connection

// Route Imports
const userRoute = require('./routes/userRoute');
const propertyRoute = require('./routes/propertyRoute');

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files (e.g., images from /uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  

// Test route
app.get('/', (req, res) => res.send('Hello World!'));

// API Routes
app.use('/api/User', userRoute);
app.use('/api/properties', propertyRoute);

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));