const jwt = require('jsonwebtoken');
require("dotenv").config()
const Users = require('../model/Users');

// Secret keys for signing the tokens
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Function to generate access and refresh tokens
function generateAccessToken(userData) {
    const { _id, fullName, phoneNumber, age, gender, aadharNumber } = userData;
const plainUserData = {
    _id: _id.toString(), // Convert ObjectId to string
    fullName,
    phoneNumber,
    age,
    gender,
    aadharNumber,
};
return jwt.sign(plainUserData, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  }
  
  function generateRefreshToken(userPhoneNumber) {
    return jwt.sign({ phoneNumber: userPhoneNumber }, REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
  }
  
  // Verify access token
  function verifyAccessToken(token) {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }


  function refreshAccessToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }

      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
      const user = Users.findOne({ phoneNumber: decoded.phoneNumber });
      if (!user) {
        throw new Error('User not found');
      }
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(decoded.phoneNumber); 
      return { newAccessToken, newRefreshToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  function verifyRefreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }
  
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
  

  function decodeToken(token) {
    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
  module.exports = { generateAccessToken, generateRefreshToken, refreshAccessToken , verifyAccessToken, verifyRefreshToken,decodeToken};