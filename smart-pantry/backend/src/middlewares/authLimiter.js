const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Limite de 5 tentativas
    message: {
        error: "Muitas tentativas de login. Tente novamente após 15 minutos."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = authLimiter;
