const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const config = {
  projectRoot: __dirname, // Ensures Metro runs in the correct folder
};

module.exports = wrapWithReanimatedMetroConfig(config);

