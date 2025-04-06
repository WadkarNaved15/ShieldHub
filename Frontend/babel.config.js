module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: process.env.NODE_ENV === 'production' 
    ? ['module:react-native-dotenv'] 
    : ['module:react-native-dotenv', 'react-refresh/babel'],
};
