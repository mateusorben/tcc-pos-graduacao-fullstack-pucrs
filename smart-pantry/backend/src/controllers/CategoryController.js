const CategoryService = require('../services/CategoryService');
const asyncHandler = require('../utils/asyncHandler');

exports.getCategories = asyncHandler(async (req, res) => {
    const categories = await CategoryService.getAll(req.userId);
    res.json(categories);
});

exports.createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const category = await CategoryService.create(req.userId, name);
    res.status(201).json(category);
});

