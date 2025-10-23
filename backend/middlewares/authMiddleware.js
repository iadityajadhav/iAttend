const jwt = require('jsonwebtoken');
const { tokenBlacklist, isTokenBlacklisted } = require('../controllers/accountController');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  if (isTokenBlacklisted(token)) {
    return res.status(403).json({ message: 'Token is blacklisted. Please log in again.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach all decoded info: id, role, collegeId, etc.
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
