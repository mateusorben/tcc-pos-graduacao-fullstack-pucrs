const StorageLocationService = require('../services/StorageLocationService');
const asyncHandler = require('../utils/asyncHandler');

exports.getAll = asyncHandler(async (req, res) => {
    const locations = await StorageLocationService.getAll(req.userId);
    res.json(locations);
});

exports.create = asyncHandler(async (req, res) => {
    const location = await StorageLocationService.create(req.userId, req.body);
    res.status(201).json(location);
});

exports.update = asyncHandler(async (req, res) => {
    const location = await StorageLocationService.update(req.userId, req.params.id, req.body);
    res.json(location);
});

exports.delete = asyncHandler(async (req, res) => {
    const response = await StorageLocationService.delete(req.userId, req.params.id);
    res.json(response);
});
