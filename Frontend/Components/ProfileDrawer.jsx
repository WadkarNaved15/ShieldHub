const ProfileHeader = require('./ProfileHeader');
const React = require('react');
const { View, Text, StyleSheet, Image,Dimensions, TouchableOpacity, Modal, Animated } = require('react-native');
const { useNavigation } = require('@react-navigation/native');


const imageMap = {
    house: require('./../assets/house.png'),
    shield: require('./../assets/shield.png'),
    bell: require('./../assets/bell.png'),
    "HerShield Heroes": require('./../assets/HerShieldHeroes.png'),
    Achievements: require('./../assets/trophy.png'),
    LogOut : require('./../assets/logout.png'),
    Lock: require('./../assets/lock.png'),
    Microphone : require('./../assets/microphone.png'),
  };


const ProfileDrawer = ({ isMenuOpen, slideAnim, toggleMenu, user,navigation, pickImage, handleLogout }) => {


    return (
      <Modal visible={isMenuOpen} animationType="none" transparent onRequestClose={toggleMenu}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1}>
          <Animated.View style={[styles.drawerRight, { transform: [{ translateX: slideAnim }] }]}>
            <TouchableOpacity style={styles.closeButton} onPress={toggleMenu}>
              <Text style={styles.closeButtonText}>x</Text>
            </TouchableOpacity>
  
            {/* Profile Header */}
            <ProfileHeader user={user} pickImage={pickImage} />
  
            {/* Menu Items */}
            <View style={styles.menuContainer}>
              <MenuItem title="Achievements" imageKey="Achievements" onPress={() => navigation.navigate('Achievements',{user:user})} />
              <MenuItem title="HerShield Heroes" imageKey="HerShield Heroes" onPress={() => navigation.navigate('HerShieldHeroes')} />
              <MenuItem title="UPDATE SOS VOICE SIGNAL" imageKey="Microphone" />
              <MenuItem title="UPDATE CONTROL PIN" imageKey="Lock" />
              <MenuItem title="LogOut" imageKey="LogOut" onPress={handleLogout} />
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const MenuItem = ({ title, imageKey, onPress }) => {
    return (
      <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.circle}>
          <Image source={imageMap[imageKey]} style={styles.iconImage} />
        </View>
        <Text style={styles.menuItemText}>{title}</Text>
      </TouchableOpacity>

    );
  };


 const styles = StyleSheet.create({
      container: {
        flex: 1,
      },
      map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
      },
      profileIcon: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10, // Ensures it's always above the map
      },
      hamburgerImage: {
        width: 25,
        height: 25,
      },
      markerContainer: {
        alignItems: 'center',
      },
      imageContainer: {
        width: 50,
        height: 50,
        borderRadius: 25, // Make the image circular
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#fff', // Add a white border around the image
      },
      userImage: {
        width: '100%',
        height: '100%',
      },
      markerPin: {
        width: 10,
        height: 10,
        backgroundColor: '#7157E4', // Color of the pin
        borderRadius: 5,
        marginTop: -10, // Align with the bottom of the image
      },
      footer: {
        height: 80,
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
      hamburgerCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#D7D0FF',
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
      emergencyButton: {
        position: 'absolute',
        bottom: 100, // Place above the footer
        left: '50%', // Center horizontally
        marginLeft: -40, // Half of button width (80 px) to center it
        backgroundColor: '#7157E4', // Red color for emergency
        width: 90,
        height: 90,
        borderRadius: 45, // Circular button
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10, // Ensure it’s above other components
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
        zIndex: 11,
      },
      emergencyIcon: {
        width: 50,
        height: 50,
      },
      emergencyOverlay: {
        ...StyleSheet.absoluteFillObject, // Cover the entire screen
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent black
      },
      drawerRight: {
        width: 250,
        backgroundColor: '#F1F1F1',
        height: '100%',
        position: 'absolute',
        right: 0, // Align the drawer to the right
      },
      overlay: {
        flex: 1, // Cover the entire screen
        justifyContent: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent black background
      },  
      menuItem: {
        fontSize: 18,
        padding: 20,
        borderTopWidth: 1,
        flexDirection: 'row',
      },
      menuItemText: {
        marginLeft: 10,
        alignSelf: 'center',
        flexWrap: 'wrap',
        flexShrink: 1,
        flexGrow: 1,
      },
      closeButton: {
        width: 40, 
        height: 40, 
        justifyContent: 'center', 
        alignItems: 'center', 
        position: 'absolute', 
        top: 10,
        left: 10, 
        borderRadius: 20,
      },
      closeButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
      },
      profileContainer: {
        padding: 20,
        alignItems: 'center',
        marginTop: 20,
      },
      profileImageOuterContainer: {
        height: 120,
        width: 120,
        borderRadius: 60,
        backgroundColor: '#7157E4',
        alignItems: 'center',
        justifyContent: 'center',
      },
      profileImageInnerContainer: {
        height: 105,
        width: 105,
        borderRadius: 52.5,
        borderWidth: 2.5,
        borderColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
      },
      profileImage: {
        width: 105,
        height: 105,
        borderRadius: 52.5,
        resizeMode: 'cover',
      },
      profileName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
      },
      profilePhoneNumber: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 5,
      },
      errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      errorMessage: {
        fontSize: 16,
        color: 'red',
        marginBottom: 10,
      },
      editImageContainer: {
        position: 'absolute',
        top: 90,
        right: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        width: 25,
        height: 25,
        borderRadius: 12.5,
      },
      editImage: {
        width: 17,
        height: 17,
        resizeMode: 'contain',
        tintColor: 'red',
      },
      loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
    });


    module.exports = {
      styles,
      ProfileDrawer
    };
    