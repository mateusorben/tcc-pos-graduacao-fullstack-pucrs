const ProductService = require('../services/ProductService');
const asyncHandler = require('../utils/asyncHandler');

exports.getProducts = asyncHandler(async (req, res) => {
    const { filter } = req.query;
    const products = await ProductService.getAll(req.userId, filter);
    res.json(products);
});

exports.getBatches = asyncHandler(async (req, res) => {
    const batches = await ProductService.getBatches(req.userId, req.params.id);
    res.json(batches);
});

exports.addBatch = asyncHandler(async (req, res) => {
    const product = await ProductService.addBatch(req.userId, req.params.id, req.body);
    res.json(product);
});

exports.updateBatch = asyncHandler(async (req, res) => {
    const product = await ProductService.updateBatch(req.userId, req.params.batchId, req.body.quantity);
    res.json(product);
});

exports.deleteBatch = asyncHandler(async (req, res) => {
    const product = await ProductService.deleteBatch(req.userId, req.params.batchId);
    res.json(product);
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

