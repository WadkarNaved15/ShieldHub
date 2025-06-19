const { View, Text, StyleSheet, Image, TouchableOpacity } = require('react-native');
const { useNavigation } = require('@react-navigation/native');
const React = require('react');
const { useState, useRef } = require('react');
const axios = require('axios').default;
const apiCall = require('../functions/axios');
const {Store} = require("lucide-react-native")

const BACKEND_URI = process.env.BACKEND_URI || 'http://your-backend-url.com';


const imageMap = {
  house: require('./../assets/house.png'),
  shield: require('./../assets/shield.png'),
  bell: require('./../assets/bell.png'),
  'HerShield Heroes': require('./../assets/HerShieldHeroes.png'),
  Achievements: require('./../assets/trophy.png'),
  LogOut: require('./../assets/logout.png'),
  Marketplace: require('./../assets/Marketplace.png'),
}
const Footer = ({ page, display, latitude, longitude,user }) => {
  const navigation = useNavigation();
  const [pressStart, setPressStart] = useState(null);
  const pressTimeoutRef = useRef(null);

  const handlePressIn = () => {
    setPressStart(Date.now());

    pressTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await apiCall({
          url: `/sos/send-sos`,
          method: 'POST',
          data: {
            latitude,
            longitude,
          },
        })
        console.log(response.data);
      } catch (error) {
        console.error('Error sending SOS signal:', error);
      }

      navigation.navigate('EmergencyPage');
    }, 2000);
  };

  const handlePressOut = () => {
    clearTimeout(pressTimeoutRef.current);
    setPressStart(null);
  };

  return (
    <>
      {display && pressStart && <View style={styles.emergencyOverlay} />}
      {display && (
        <TouchableOpacity
          style={styles.emergencyButton}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <View style={styles.emergencyButtonInner}>
            <Image source={require('./../assets/emergency.png')} style={styles.emergencyIcon} />
          </View>
        </TouchableOpacity>
      )}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate('Home')}>
          <View style={[styles.circle, page === 'Home' && styles.activeCircle]}>
            <Image source={imageMap.house} style={styles.iconImage} />
          </View>
          <Text style={styles.iconText}>Home</Text>
        </TouchableOpacity>

        {display && (
          <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate('FeelingUnsafe',{userPhone:user.phoneNumber})}>
            <View style={[styles.circle, page === 'FeelingUnsafe' && styles.activeCircle]}>
              <Image source={imageMap.shield} style={styles.iconImage} />
            </View>
            <Text style={styles.iconText}>Feeling Unsafe</Text>
          </TouchableOpacity>
        )}

        {/* <TouchableOpacity onPress={() => navigation.navigate('EmergencyNotifications')} style={styles.iconContainer}>
          <View style={[styles.circle, page === 'EmergencyNotifications' && styles.activeCircle]}>
            <Image source={imageMap.bell} style={styles.iconImage} />
          </View>
        </TouchableOpacity> */}
         <TouchableOpacity onPress={() => navigation.navigate('EmergencyNotifications')} style={styles.iconContainer}>
          <View style={[styles.circle, page === 'EmergencyNotifications' && styles.activeCircle]}>
            <Image source={imageMap.bell} style={styles.iconImage} />
          </View>
          <Text style={styles.iconText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Marketplace')} style={styles.iconContainer}>
          <View style={[styles.circle, page === 'Marketplace' && styles.activeCircle]}>
            <Image source={imageMap.Marketplace} style={styles.iconImage} />
          </View>
          <Text style={styles.iconText}>Marketplace</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  emergencyButton: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    marginLeft: -40,
    backgroundColor: '#7157E4',
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emergencyButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF0000',
  },
  emergencyIcon: {
    width: 50,
    height: 50,
  },
  emergencyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  footer: {
    height: 80,
    paddingHorizontal: 10,
    backgroundColor: '#E8E8E8',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
  },
  circle: {
    width: 50,
    height: 50,
    backgroundColor: '#D7D0FF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCircle: {
    backgroundColor: '#FFEDC0',
    borderColor: '#FFEDC0',
  },
  iconImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  iconText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: 600,
  },
});

module.exports = Footer;
