const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function getTokenFromCookie(req){
  return req.cookies && req.cookies.token;
}

function requireAuth(role = null){
  return (req, res, next) => {
    try {
      const token = getTokenFromCookie(req);
      if (!token) return res.status(401).json({ message: 'Unauthorized' });
      const payload = jwt.verify(token, JWT_SECRET);
      if (role && payload.role !== role) return res.status(403).json({ message: 'Forbidden' });
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid auth' });
    }
  }
}

module.exports = { requireAuth, getTokenFromCookie };
