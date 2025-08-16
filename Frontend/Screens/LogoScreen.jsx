const React = require('react');
const { useEffect, useContext } = React;
const { View, Text, StyleSheet, Image, ActivityIndicator } = require('react-native');
const { UserContext } = require('../Context/User');
const { getToken } = require('../functions/secureStorage');

const LogoScreen = ({ navigation }) => {
  const { isAuthenticated, loading, loadUser } = useContext(UserContext);

  useEffect(() => {
    const init = async () => {
      await loadUser(); // 🔄 Always attempt to load user from context
    };

    init();
  }, []);

  useEffect(() => {
    const navigateAfterAuthCheck = async () => {
      if (!loading) {
        if (isAuthenticated) {
          const module = await getToken('module');
          if (module) {
            navigation.replace(module); // 🚀 Navigate to saved module
          } else {
            navigation.replace('Modules'); // 🧭 Default module
          }
        } else {
          navigation.replace('Login'); // 🔐 Not authenticated
        }
      }
    };

    navigateAfterAuthCheck();
  }, [loading, isAuthenticated]);

  return (
    <View style={styles.splashContainer}>
      <Image source={require('../assets/HerShield.jpeg')} style={styles.logo} />
      <Text style={styles.splashText}>Welcome to HerShield</Text>

      {loading && <ActivityIndicator size="large" color="#ffffff" />}
    </View>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7157e4',
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
  },
  splashText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

module.exports = LogoScreen;
