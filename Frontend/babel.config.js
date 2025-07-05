// module.exports = {
//   presets: ['module:@react-native/babel-preset'],
//   plugins: process.env.NODE_ENV === 'production' 
//     ? ['module:react-native-dotenv'] 
//     : ['module:react-native-dotenv', 'react-refresh/babel'],
// };



module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      blacklist: null,
      whitelist: null,
      safe: false,
      allowUndefined: true
    }],
    ...(process.env.NODE_ENV !== 'production' ? ['react-refresh/babel'] : []),
  ],
};
