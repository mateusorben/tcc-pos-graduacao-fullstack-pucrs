const ProductService = require('../services/ProductService');
const asyncHandler = require('../utils/asyncHandler');

exports.getProducts = asyncHandler(async (req, res) => {
    const products = await ProductService.getAll(req.userId);
    res.json(products);
});

exports.createProduct = asyncHandler(async (req, res) => {
    const product = await ProductService.create(req.userId, req.body);
    res.status(201).json(product);
});

exports.updateProduct = asyncHandler(async (req, res) => {
    const product = await ProductService.update(req.userId, req.params.id, req.body);
    res.json(product);
});

exports.deleteProduct = asyncHandler(async (req, res) => {
    const result = await ProductService.delete(req.userId, req.params.id);
    res.json(result);
});

exports.updateQuantity = asyncHandler(async (req, res) => {
    const product = await ProductService.updateQuantity(req.userId, req.params.id, req.body.quantity);
    res.json(product);
});

exports.getShoppingList = asyncHandler(async (req, res) => {
    const list = await ProductService.getShoppingList(req.userId);
    res.json(list);
});

