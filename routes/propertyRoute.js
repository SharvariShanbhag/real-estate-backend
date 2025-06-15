const express = require('express');
const propertyController = require('../controllers/propertyController');
const {auth,isAdmin } = require('../middleware/auth')
const multer = require('../middleware/multer')
const router = express.Router();

router.get('/getAllProperties', propertyController.getAllProperties);
router.get('/getPropertyById/:id', propertyController.getPropertyById);
router.post('/createProperty',   auth,isAdmin ,multer.single('image'), propertyController.createProperty);
router.put('/updateProperty/:id', auth,isAdmin , propertyController.updateProperty);
router.delete('/deleteProperty/:id',  auth,isAdmin , propertyController.deleteProperty);
router.get('/search', propertyController.searchProperties);
router.put('/AddUpdateIntresteUser/:id', auth, propertyController.AddUpdateIntrestedUser)


module.exports = router