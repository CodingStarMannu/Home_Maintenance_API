
const Category = require('../models/category');



const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newCategory = new Category({ name, description });

        const savedCategory = await newCategory.save();
        res.status(201).json({ success: true,message: 'Category created Successfully', data: savedCategory });
    } catch (error) {
        console.log('Error in creating category', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, message: 'All Categories retrieved Successfully',data: categories });
    } catch (error) {
        console.log('Error in getting categories', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({ success: true, message: 'Category retrieved Successfully', data: category });
    } catch (error) {
        console.log('Error in getting category by ID', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        const { name, description } = req.body;

        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { name, description },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({ success: true, message: 'Category update SuccessFully', data: updatedCategory });
    } catch (error) {
        console.log('Error in updating category by ID', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const deleteCategory= async (req, res) => {
    try {
        const categoryId = req.params.id;

        const deletedCategory = await Category.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({ success: true,message: 'Category Deleted Successfully', data: deletedCategory });
    } catch (error) {
        console.log('Error in deleting category by ID', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



module.exports = { getCategories, getCategoryById, createCategory,updateCategory, deleteCategory };
