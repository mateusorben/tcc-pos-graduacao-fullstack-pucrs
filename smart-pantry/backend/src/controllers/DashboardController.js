const DashboardService = require('../services/DashboardService');
const asyncHandler = require('../utils/asyncHandler');

exports.getStats = asyncHandler(async (req, res) => {
    const stats = await DashboardService.getStats(req.userId);
    res.json(stats);
});

