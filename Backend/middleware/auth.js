const { verifyAccessToken } = require('../utils/jwt');

const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }

    req.user = decoded; // Now safe to attach
    console.log("✅ Authenticated User:", req.user);

    next();
  } catch (error) {
    console.error("❌ Auth error:", error);
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = auth;
