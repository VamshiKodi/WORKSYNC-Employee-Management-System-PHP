const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify token with explicit algorithm; optionally wire issuer/audience via env
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', {
      algorithms: ['HS256']
    });
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin role required.' });
      }
      next();
    });
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(403).json({ message: 'Access denied.' });
  }
};

// Role-based authorization: allow any of the given roles
const roleAuth = (roles = []) => async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied. Insufficient role.' });
      }
      next();
    });
  } catch (error) {
    console.error('Role auth middleware error:', error);
    res.status(403).json({ message: 'Access denied.' });
  }
};

module.exports = { auth, adminAuth, roleAuth };