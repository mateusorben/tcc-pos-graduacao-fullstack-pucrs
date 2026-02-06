const UserService = require('../services/UserService');
const asyncHandler = require('../utils/asyncHandler');

exports.register = asyncHandler(async (req, res) => {
    const user = await UserService.register(req.body);
    res.status(201).json(user);
});

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await UserService.login(email, password);

    // Set HttpOnly Cookie
    res.cookie('token', result.token, {
        httpOnly: true, // Prevent JS access
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
        sameSite: 'strict', // CSRF protection
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Don't send token in body anymore
    res.json({
        message: result.message,
        user: result.user
    });
});


exports.updateProfile = asyncHandler(async (req, res) => {
    const user = await UserService.updateProfile(req.userId, req.body);
    res.json({
        message: 'Informações atualizadas com sucesso!',
        user
    });
});

exports.subscribe = asyncHandler(async (req, res) => {
    await UserService.subscribe(req.userId, req.body);
    res.status(201).json({});
});

exports.getVapidKey = asyncHandler(async (req, res) => {
    const key = UserService.getVapidKey();
    res.json(key);
});


exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout realizado com sucesso' });
};
