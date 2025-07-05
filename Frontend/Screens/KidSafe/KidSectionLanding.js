import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { UserContext } from '../../Context/User';


 import { getToken} from '../../functions/secureStorage'; // Adjust path


const KidSectionLanding = ({ navigation }) => {
    const {logout} = useContext(UserContext);

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const token = await getToken('accessToken');
    setLoggedIn(!!token);
  };

  const handleLogout = async () => {
    await logout();
    setLoggedIn(false);
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF7ED' }}>
      <Text style={{ fontSize: 24, marginBottom: 30 }}>Choose Mode</Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('ParentLink')}
        style={styles.modeButton}
      >
        <Image source={require('../../assets/parent.png')} style={styles.icon} />
        <Text style={styles.label}>Parent</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('KidModeScreen')}
        style={styles.modeButton}
      >
        <Image source={require('../../assets/kids.png')} style={styles.icon} />
        <Text style={styles.label}>Kid</Text>
      </TouchableOpacity>

      {/* 🔐 Show either Login or Logout based on state */}
      {loggedIn ? (
        <TouchableOpacity onPress={handleLogout} style={{ marginTop: 20 }}>
          <Text style={[styles.label, { color: 'red' }]}>Logout</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 20 }}>
          <Text style={[styles.label, { color: '#4B5563' }]}>Login</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modeButton: {
    backgroundColor: '#A78BFA22',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 10,
    width: 200,
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    color: '#4B5563',
  },
});

// module.exports = KidSectionLanding;
export default KidSectionLanding;

