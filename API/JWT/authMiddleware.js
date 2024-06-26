const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Accès refusé. Aucun jeton fourni.' });
    }

    const token = authHeader.substring(7); // Supprime le préfixe 'Bearer '

    try {
        const decoded = jwt.verify(token, 'ONCzRs3kqu!yF?wH');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Session expiré. Reconnexion demandé.' });
    }
}

module.exports = authMiddleware;