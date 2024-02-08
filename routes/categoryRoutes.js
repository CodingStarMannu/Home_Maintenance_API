const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
// const authMiddleware = require('../middlewares/authMiddleware');




router.post('/create-categories', categoryController.createCategory);
router.get('/get-categories', categoryController.getCategories);
router.get('/get-categories/:id', categoryController.getCategoryById);
router.put('/update-categories/:id',  categoryController.updateCategory);
router.delete('/delete-categories/:id', categoryController.deleteCategory);

module.exports = router;
