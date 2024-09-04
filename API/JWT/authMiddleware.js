const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Accès refusé. Aucun jeton fourni.' });
    }

    const token = authHeader.substring(7); // Supprime le préfixe 'Bearer '

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Session expiré. Reconnexion demandé.' });
    }
}

module.exports = authMiddleware;