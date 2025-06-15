// const jwt = require('jsonwebtoken');
// const { User } = require('../models');
// const bcrypt = require('bcryptjs');
// require('dotenv').config();

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // 1. Find user
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(401).json({ 
//         success: false,
//         message: 'Invalid credentials' 
//       });
//     }

//     // 2. Verify password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ 
//         success: false,
//         message: 'Invalid credentials' 
//       });
//     }

//     // 3. Generate token with expiration
//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES_IN }
//     );

//     // 4. Respond with token
//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });

//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Login failed',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Add this to your User model if not already present
// User.prototype.comparePassword = async function(password) {
//   return await bcrypt.compare(password, this.password);
// };