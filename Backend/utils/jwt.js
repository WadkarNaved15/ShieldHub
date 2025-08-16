const jwt = require('jsonwebtoken');
require("dotenv").config();
const Users = require('../model/Users');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

console.log("🔑 Access Token Secret:", ACCESS_TOKEN_SECRET);
console.log("🔑 Refresh Token Secret:", REFRESH_TOKEN_SECRET);

// 1. Generate access token
function generateAccessToken(userData) {
  const { _id, fullName, phoneNumber, age, gender, aadharNumber, role } = userData;
  const payload = {
    _id: _id.toString(),
    fullName,
    phoneNumber,
    age,
    gender,
    role,
    aadharNumber,
  };

  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '1d' }); 
}

// 2. Generate refresh token
function generateRefreshToken(phoneNumber) {
  return jwt.sign({ phoneNumber }, REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
}

// 3. Verify access token safely
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (error) {
    console.error("❌ JWT Verification Error:", error.name, error.message);
    // Attach status for centralized handling
    if (error.name === 'TokenExpiredError') {
      error.status = 401;
      error.message = 'Access token expired';
    } else {
      error.status = 403;
      error.message = 'Invalid access token';
    }
    throw error;
  }
}

// 4. Verify refresh token safely
function verifyRefreshToken(refreshToken) {
  try {
    console.log("🔑 Verifying Refresh Token:", refreshToken);
    return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Refresh token expired');
      err.status = 401;
      throw err;
    } else if (error.name === 'JsonWebTokenError') {
      const err = new Error('Invalid refresh token');
      err.status = 401;
      throw err;
    } else {
      throw error;
    }
  }
}


// 5. Refresh access token using refresh token
async function refreshAccessToken(refreshToken) {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await Users.findOne({ phoneNumber: decoded.phoneNumber });
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user.phoneNumber);
    return { newAccessToken, newRefreshToken };
  } catch (error) {
    throw error; // Already tagged above
  }
}

// 6. Decode token payload only (no verification)
function decodeToken(token) {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    console.error("❌ Decode Error:", error.message);
    return null;
  }
}

// 7. Check if token is expired manually
function isTokenExpired(token) {
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired
};
