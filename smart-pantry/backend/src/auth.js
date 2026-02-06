const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Check cookie first, then header (backward compatibility or testing)
    const token = req.cookies.token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded.userId;

        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
};