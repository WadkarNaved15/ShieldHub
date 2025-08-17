const React  =require("react");
const { useRef, useEffect } = require("react");
const { View, ActivityIndicator, StyleSheet } =require("react-native");

const Loader= () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8b5cf6" /> 
      {/* #8b5cf6 = purple-500 */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});


module.exports = Loader;
