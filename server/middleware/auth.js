const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing.');
  }
  return secret;
};

const auth = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token. Send Authorization: Bearer <token>.' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return res.status(401).json({ error: 'Missing token. Send Authorization: Bearer <token>.' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User no longer exists.' });
    }
    req.user = user;
    req.admin = { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Expired token. Please login again.' });
    }
    if (error.message === 'JWT_SECRET environment variable is missing.') {
      return res.status(500).json({ error: 'Authentication is not configured on the server.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role || req.admin?.role;
    if (!userRole) {
      return res.status(401).json({ error: 'Missing token. Send Authorization: Bearer <token>.' });
    }
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Forbidden. Admin role is required.' });
    }
    next();
  };
};

module.exports = { auth, requireRole, getJwtSecret };
