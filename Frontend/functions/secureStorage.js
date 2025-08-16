const Keychain = require('react-native-keychain');

// Save a token with a specific key
async function saveToken(key, value) {
  try {
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`❌ Invalid value for token "${key}": ${value}`);
    }

    await Keychain.setGenericPassword(key, value, { service: key });
    console.log('✅ Token saved successfully for:', key);
  } catch (error) {
    console.error('🚫 Error saving token:', error.message, error);
  }
}

// Retrieve a token by key
async function getToken(key) {
  try {
    const credentials = await Keychain.getGenericPassword({ service: key });
    if (credentials) {
      return credentials.password;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
}

// Delete a token by key
async function deleteToken(key) {
  try {
    await Keychain.resetGenericPassword({ service: key });
  } catch (error) {
    console.error('Error deleting token:', error);
  }
}

module.exports = { saveToken, getToken, deleteToken };