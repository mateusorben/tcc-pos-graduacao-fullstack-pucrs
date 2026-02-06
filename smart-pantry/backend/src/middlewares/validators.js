const validator = require('validator');
const AppError = require('../utils/AppError');

exports.validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2) {
        throw new AppError('Nome deve ter pelo menos 2 caracteres.');
    }

    if (!email || !validator.isEmail(email)) {
        throw new AppError('E-mail inválido.');
    }

    if (!password || password.length < 6) {
        throw new AppError('Senha deve ter pelo menos 6 caracteres.');
    }

    // Sanitize
    req.body.name = validator.escape(name.trim());
    req.body.email = validator.normalizeEmail(email);

    next();
};

exports.validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !validator.isEmail(email)) {
        throw new AppError('E-mail inválido.');
    }

    if (!password) {
        throw new AppError('Senha é obrigatória.');
    }

    next();
};
