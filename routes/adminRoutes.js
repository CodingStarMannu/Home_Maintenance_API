const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/create-categories', adminController.createCategory);

router.get('/get-categories', adminController.getCategories);

router.get('/get-categories/:id', adminController.getCategoryById);

router.put('/update-categories/:id',  adminController.updateCategory);

router.delete('/delete-categories/:id', adminController.deleteCategory);

router.post('/create_sub_cat', adminController.createSubcategory);

router.get('/:get_by_categoryId', adminController.getSubcategories);

router.get('/subcategory/:subcategoryId', adminController.getSubcategoryById);

router.patch('/:subcategoryId', adminController.updateSubcategory);

router.delete('/:subcategoryId', adminController.deleteSubcategory);


module.exports = router;
