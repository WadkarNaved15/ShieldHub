const { verifyAccessToken } = require('../utils/jwt');

function getUserFromToken(req) {
  const token = req.headers.authorization;
  console.log("🔍 Extracting user from token:", token);
  if (!token || !token.startsWith('Bearer ')) {
    throw { status: 401, message: 'Unauthorized' };
  }
  
  const extractedToken = token.split(' ')[1];
  const decoded = verifyAccessToken(extractedToken);
  if (!decoded) {
    throw { status: 403, message: 'Invalid or expired token' };
  }
  
  return decoded;
}

module.exports = { getUserFromToken };