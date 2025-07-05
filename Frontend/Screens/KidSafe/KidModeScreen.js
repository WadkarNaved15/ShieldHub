import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Clipboard, Alert, StyleSheet } from 'react-native';
import apiCall from '../../functions/axios'; // ✅ correct path (go up two levels)
import { ScrollView } from 'react-native-gesture-handler';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const KidModeScreen = () => {
  const [kidCode, setKidCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [parentInfo, setParentInfo] = useState(null);
const [connected, setConnected] = useState(false);

const navigation = useNavigation();



const safetyTips = [
  {
    image: require('../../assets/safety/stranger.png'),
    title: 'Don’t Talk to Strangers',
    description: 'If someone you don’t know talks to you, tell your parent or teacher.',
  },
  {
    image: require('../../assets/safety/gps.png'),
    title: 'Keep GPS On',
    description: 'Always keep your location turned on to stay safe.',
  },
  {
    image: require('../../assets/safety/emergency.png'),
    title: 'Emergency',
    description: 'Use the sos if you feel unsafe. Your parent will be alerted.',
  },
];



const funFacts = [
  "Did you know? Always stay in a group when you're outside!",
  "Fun Fact: Your parents can track your location for safety!",
  "Remember: It's okay to say 'no' to someone if you feel uncomfortable."
];




 const fetchKidCode = async () => {
  setLoading(true);
  try {
    const response = await apiCall({ method: 'GET', url: '/kid/generate-code' });
    if (response && response.kidCode) {
      setKidCode(response.kidCode);
    }
  } catch {
    Alert.alert("Error", "Couldn't generate code");
  } finally {
    setLoading(false);
  }
};



const fetchParentInfo = async () => {
  try {
    const response = await apiCall({ method: 'GET', url: '/kid/parent-info' });
    console.log("👨‍👩‍👧 Parent Info Response:", response);
    if (response?.connected) {
      setParentInfo(response.parent);
      setConnected(true);
    }
  } catch (err) {
    console.log("Error fetching parent info:", err);
  }
};


  const regenerateCode = async () => {
    setLoading(true);
    try {
      const response = await apiCall({ url: '/kid/regenerate-code', method: 'POST' });
      setKidCode(response.data.kidCode);
      Alert.alert("New Code", "A new code has been generated");
    } catch (err) {
      Alert.alert("Error", "Couldn't regenerate code");
    } finally {
      setLoading(false);
    }
  };

 const copyToClipboard = () => {
  if (!kidCode) {
    Alert.alert("No Code", "There's no code to copy!");
    return;
  }
  Clipboard.setString(kidCode);
  Alert.alert("Copied", "Code copied to clipboard!");
};


 useEffect(() => {
  fetchKidCode();
  fetchParentInfo();
}, []);

  return (
 
<View style={{ flex: 1, padding: 30, backgroundColor: '#FFF7ED' }}>
  {loading ? (
    <ActivityIndicator size="large" />
  ) : connected && parentInfo ? (
    <>
      <View style={{ padding: 20, backgroundColor: '#E0F2FE', borderRadius: 15 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✅ You're connected to:</Text>
        <Text style={{ fontSize: 16, marginTop: 5 }}>👤 {parentInfo.fullName}</Text>
        <Text style={{ fontSize: 16 }}>📞 {parentInfo.phoneNumber}</Text>
      </View>

      {/* 🛡️ Safety Tips Section Starts Here */}
      <View style={{ marginTop: 30 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
          🛡️ Safety Lessons Just for You
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {safetyTips.map((tip, index) => (
            <View key={index} style={styles.card}>
              <Image source={tip.image} style={styles.image} resizeMode="contain" />
              <Text style={styles.cardTitle}>{tip.title}</Text>
              <Text style={styles.cardDesc}>{tip.description}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

   <View style={styles.funFactsContainer}>
  <Text style={styles.funFactsTitle}>
    🌟 Safety Facts
  </Text>
  {funFacts.map((fact, index) => (
    <Text key={index} style={styles.funFactText}>
      {fact}
    </Text>
  ))}
</View>

<TouchableOpacity
  style={{
    marginTop: 30,
    backgroundColor: '#4ADE80',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  }}
  onPress={() => navigation.navigate('KidSafeHome')} // Change 'KidHome' to your home screen route name
>
  <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>🚀 Go to Dashboard</Text>
</TouchableOpacity>

    </>
  ) : kidCode ? (
    <View style={{ padding: 20, backgroundColor: '#fff', borderRadius: 15, alignItems: 'center' }}>
      <Text style={{ fontSize: 40, letterSpacing: 2 }}>{kidCode}</Text>
      <TouchableOpacity
        onPress={copyToClipboard}
        style={{ marginTop: 15, backgroundColor: '#A78BFA', padding: 10, borderRadius: 10 }}
      >
        <Text style={{ color: 'white' }}>Copy Code</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={regenerateCode}
        style={{ marginTop: 15, backgroundColor: '#EF4444', padding: 10, borderRadius: 10 }}
      >
        <Text style={{ color: 'white' }}>Generate New Code</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <Text style={{ color: 'red' }}>🚫 Unable to fetch kid code.</Text>
  )}
</View>

);
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    padding: 15,
    marginRight: 15,
    backgroundColor: '#FFF1F2',
    borderRadius: 15,
    alignItems: 'center',
    borderColor: '#FCA5A5',
    borderWidth: 1,
  },

  funFactsContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#E0F7FA', // Light background for contrast
    borderRadius: 15,
    borderColor: '#B2EBF2', // Border color
    borderWidth: 1,
    shadowColor: '#000', // Shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  funFactsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#00796B', // Title color
  },
  funFactText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#004D40', // Text color
  },
  
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 5,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 14,
    textAlign: 'center',
    color: '#374151',
  }

});




export default KidModeScreen;
