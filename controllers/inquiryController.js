// const { Inquiry, Property, User } = require('../models');
// const { Op } = require('sequelize');

// // Create inquiry
// const createInquiry = async (req, res) => {
//   try {
//     const { name, email, phone, message, propertyId, inquiryType } = req.body;
    
//     // Check if property exists for property inquiries
//     if (inquiryType === 'property') {
//       const property = await Property.findByPk(propertyId);
//       if (!property) {
//         return res.status(404).json({ success: false, message: 'Property not found' });
//       }
//     }
    
//     const inquiry = await Inquiry.create({
//       name,
//       email,
//       phone,
//       message,
//       propertyId: inquiryType === 'property' ? propertyId : null,
//       inquiryType,
//       userId: req.user?.id || null
//     });
    
//     res.status(201).json({ 
//       success: true, 
//       message: 'Inquiry submitted successfully',
//       inquiry 
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to create inquiry',
//       error: error.message 
//     });
//   }
// };

// // Get all inquiries (admin only)
// const getAllInquiries = async (req, res) => {
//   try {
//     const { status, inquiryType, search, page = 1, limit = 10 } = req.query;
//     const where = {};
//     const offset = (page - 1) * limit;
    
//     if (status) where.status = status;
//     if (inquiryType) where.inquiryType = inquiryType;
    
//     if (search) {
//       where[Op.or] = [
//         { name: { [Op.like]: `%${search}%` } },
//         { email: { [Op.like]: `%${search}%` } },
//         { phone: { [Op.like]: `%${search}%` } },
//         { message: { [Op.like]: `%${search}%` } }
//       ];
//     }
    
//     const { count, rows: inquiries } = await Inquiry.findAndCountAll({
//       where,
//       include: [
//         {
//           model: Property,
//           attributes: ['id', 'title', 'price', 'city'],
//           required: false
//         },
//         {
//           model: User,
//           attributes: ['id', 'name', 'email'],
//           required: false
//         }
//       ],
//       order: [['createdAt', 'DESC']],
//       limit: parseInt(limit),
//       offset: parseInt(offset)
//     });
    
//     res.status(200).json({ 
//       success: true,
//       count,
//       totalPages: Math.ceil(count / limit),
//       currentPage: parseInt(page),
//       inquiries
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch inquiries',
//       error: error.message 
//     });
//   }
// };

// // Get single inquiry (admin only)
// const getInquiry = async (req, res) => {
//   try {
//     const inquiry = await Inquiry.findByPk(req.params.id, {
//       include: [
//         {
//           model: Property,
//           attributes: ['id', 'title', 'price', 'city'],
//           required: false
//         },
//         {
//           model: User,
//           attributes: ['id', 'name', 'email'],
//           required: false
//         }
//       ]
//     });
    
//     if (!inquiry) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Inquiry not found' 
//       });
//     }
    
//     res.status(200).json({ 
//       success: true, 
//       inquiry 
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch inquiry',
//       error: error.message 
//     });
//   }
// };

// // Update inquiry status (admin only)
// const updateInquiryStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     const inquiry = await Inquiry.findByPk(req.params.id);
    
//     if (!inquiry) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Inquiry not found' 
//       });
//     }
    
//     if (!['pending', 'contacted', 'resolved'].includes(status)) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Invalid status value' 
//       });
//     }
    
//     await inquiry.update({ status });
//     res.status(200).json({ 
//       success: true, 
//       message: 'Inquiry status updated successfully',
//       inquiry 
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to update inquiry status',
//       error: error.message 
//     });
//   }
// };

// // Delete inquiry (admin only)
// const deleteInquiry = async (req, res) => {
//   try {
//     const inquiry = await Inquiry.findByPk(req.params.id);
    
//     if (!inquiry) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Inquiry not found' 
//       });
//     }
    
//     await inquiry.destroy();
//     res.status(200).json({ 
//       success: true, 
//       message: 'Inquiry deleted successfully' 
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to delete inquiry',
//       error: error.message 
//     });
//   }
// };

// module.exports = {
//   createInquiry,
//   getAllInquiries,
//   getInquiry,
//   updateInquiryStatus,
//   deleteInquiry
// };