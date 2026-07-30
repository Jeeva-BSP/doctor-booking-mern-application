import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'book_a_doctor_secret_jwt_key_2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }

    try {
      const user = await User.findById(decoded.user_id).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User account not found.' });
      }

      const userObj = user.toObject();
      userObj.user_id = user._id;

      req.user = userObj;
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Authentication failed.' });
    }
  });
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
}

export { JWT_SECRET };
