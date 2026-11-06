import jwt from 'jsonwebtoken';

/**
 * Middleware to verify user JWT token.
 */
export const verifyUserToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1] || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token.' });
  }
};

/**
 * Middleware to verify admin JWT token.
 */
export const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1] || req.cookies?.adminToken;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Admin access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin && decoded.role !== 'super_admin' && decoded.role !== 'moderator') {
      return res.status(403).json({ success: false, error: 'Insufficient admin privileges.' });
    }
    req.user = decoded;
    next();
  } catch (ex) {
    return res.status(403).json({ success: false, error: 'Invalid or expired admin token.' });
  }
};
