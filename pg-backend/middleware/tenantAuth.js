const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

module.exports = function tenantAuth(req, res, next) {
  try {
    const token = req.cookies && req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const payload = jwt.verify(token, JWT_SECRET);

    if (payload.role !== 'tenant') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // attach tenant info
    req.tenant = payload; // { id, role, email, full_name }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
