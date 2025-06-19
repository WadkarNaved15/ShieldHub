const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  projectRoot: __dirname, // Ensures Metro runs in the correct folder
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

