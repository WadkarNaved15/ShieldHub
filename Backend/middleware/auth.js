const { verifyAccessToken } = require('../utils/jwt');

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' }); // 401 = unauthorized
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token); // This should throw if token is invalid/expired

    req.user = decoded;
    console.log("✅ Authenticated User:", req.user);
    next();
  } catch (error) {
    console.error("❌ Auth error:", error.message);

    // Use 401 for expired/invalid tokens instead of 403 (403 = forbidden = valid token but no permission)
    return res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError'
        ? 'Token expired'
        : 'Invalid token',
    });
  }
};

module.exports = auth;
