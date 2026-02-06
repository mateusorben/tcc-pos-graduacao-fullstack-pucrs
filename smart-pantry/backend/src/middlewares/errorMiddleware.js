const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        console.error('❌ ERROR:', err);
    }

    // Erros operacionais (conhecidos)
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err.message,
        });
    }

    // Erros de programação ou desconhecidos
    console.error('🔥 CRITICAL ERROR:', err);
    return res.status(500).json({
        status: 'error',
        error: 'Algo deu errado no servidor. Tente novamente mais tarde.',
    });
};

module.exports = errorHandler;
