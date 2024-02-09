
const Category = require('../models/category');
const Subcategory = require('../models/subcategory');

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


//subCategory
const createSubcategory = async (req, res) => {
    try {
        const { name, description, categoryId } = req.body;
        const newSubcategory = new Subcategory({ name, description, category: categoryId });

        const savedSubcategory = await newSubcategory.save();
        res.status(201).json({ success: true, message: 'Subcategory created successfully', data: savedSubcategory });
    } catch (error) {
        console.log('Error in creating subcategory', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getSubcategories = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const subcategories = await Subcategory.find({ category: categoryId });
        res.status(200).json({ success: true, message: 'Subcategories retrieved successfully', data: subcategories });
    } catch (error) {
        console.log('Error in getting subcategories', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getSubcategoryById = async (req, res) => {
    try {
        const subcategoryId = req.params.subcategoryId;
        const subcategory = await Subcategory.findById(subcategoryId);

        if (!subcategory) {
            return res.status(404).json({ success: false, message: 'Subcategory not found' });
        }

        res.status(200).json({ success: true, message: 'Subcategory retrieved successfully', data: subcategory });
    } catch (error) {
        console.log('Error in getting subcategory by ID', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const updateSubcategory = async (req, res) => {
    try {
        const subcategoryId = req.params.subcategoryId;
        const { name, description } = req.body;

        const updatedSubcategory = await Subcategory.findByIdAndUpdate(
            subcategoryId,
            { name, description },
            { new: true }
        );

        if (!updatedSubcategory) {
            return res.status(404).json({ success: false, message: 'Subcategory not found' });
        }

        res.status(200).json({ success: true, message: 'Subcategory updated successfully', data: updatedSubcategory });
    } catch (error) {
        console.log('Error in updating subcategory', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const deleteSubcategory = async (req, res) => {
    try {
        const subcategoryId = req.params.subcategoryId;
        const deletedSubcategory = await Subcategory.findByIdAndDelete(subcategoryId);

        if (!deletedSubcategory) {
            return res.status(404).json({ success: false, message: 'Subcategory not found' });
        }

        res.status(200).json({ success: true, message: 'Subcategory deleted successfully', data: deletedSubcategory });
    } catch (error) {
        console.log('Error in deleting subcategory', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};




module.exports = { getCategories, getCategoryById, createCategory,updateCategory, deleteCategory,createSubcategory, getSubcategories, getSubcategoryById, updateSubcategory, deleteSubcategory  };
