const React = require('react');
const { useEffect, useState, useContext } = React;
const { NavigationContainer } = require('@react-navigation/native');
const { navigationRef } = require('./services/navigationService');
const { createStackNavigator } = require('@react-navigation/stack');
const { check, request, PERMISSIONS, RESULTS } = require('react-native-permissions');
const { Platform, Alert } = require('react-native');
const FCMService = require('./services/fcmService');
const { getToken, deleteToken } = require('./functions/secureStorage');
const { decodeToken } = require('./functions/token');

const LogoScreen = require('./Screens/LogoScreen');
const LoginScreen = require('./Screens/Login');
const SignUpScreen = require('./Screens/SignUp');
const HomeScreen = require('./Screens/HerShield/Home');
const HerShieldHeroes = require('./Screens/HerShield/HerShieldHeroes');
const Achievements = require('./Screens/HerShield/Achievements');
const EmergencyPageScreen = require('./Screens/EmergencyPage');
const AchievementsForm = require('./Screens/AchievementsForm');
const EmergencyNotificationsScreen = require('./Screens/EmergencyNotifications');
const FeelingUnsafe = require('./Screens/HerShield/FeelingUnsafe');
const AchievementsScreen = require('./Screens/AchievementsScreen');
// const HerShieldHeroesScreen = require('./Screens/HerShield/HerShieldHeroesScreen');
// const HelperRoute = require('./Screens/HelperRoute'); 
const Marketplace = require('./Screens/HerShield/Marketplace');
const Modules = require('./Screens/Modules');
const KidSafeHome = require('./Screens/KidSafe/Home');
import KidModeScreen from './Screens/KidSafe/KidModeScreen';
import KidSectionLanding from './Screens/KidSafe/KidSectionLanding';
import ParentLink from './Screens/KidSafe/ParentLink';
import ParentHome from './Screens/KidSafe/ParentHome'
import Schedule from './Screens/KidSafe/Schedule';
import GeoFence from './Screens/KidSafe/GeoFence';

const EmergencyInfo = require('./Screens/HerShield/EmergencyInfo');

const { FeelingUnsafeProvider } = require('./Context/FeelingUnsafe');
const { UserProvider, UserContext } = require('./Context/User');
const { LocationProvider } = require('./Context/Location');

const firebase = require('@react-native-firebase/app').default;
const firebaseConfig = require('./config/firebaseConfig');

const Stack = createStackNavigator();

function AppContent() {
  const { isAuthenticated, loading } = useContext(UserContext);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        if (!firebase.apps.length) {
          await firebase.initializeApp(firebaseConfig);
          console.log(" Firebase initialized successfully");
        } else {
          console.log("Firebase already initialized");
        }

        FCMService.requestPermission();

        if (!loading) {
          if (isAuthenticated) {
            FCMService.getFCMToken();
            FCMService.listenForNotifications();
          }
        }
      } catch (error) {
        console.error(" Error initializing Firebase:", error);
      }
    };

    const requestPermissions = async () => {
      try {
        const permissionsToRequest = [];

        if (Platform.OS === 'android') {
          permissionsToRequest.push(
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
            PERMISSIONS.ANDROID.RECORD_AUDIO,
            PERMISSIONS.ANDROID.CAMERA,
            PERMISSIONS.ANDROID.INTERNET,
            PERMISSIONS.ANDROID.WAKE_LOCK,
            PERMISSIONS.ANDROID.POST_NOTIFICATIONS
          );

          if (Platform.Version >= 34) {
            permissionsToRequest.push(PERMISSIONS.ANDROID.FOREGROUND_SERVICE_MICROPHONE);
          }

          if (Platform.Version >= 33) {
            permissionsToRequest.push(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
          }
        } else {
          permissionsToRequest.push(
            PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
            PERMISSIONS.IOS.MICROPHONE,
            PERMISSIONS.IOS.CAMERA,
            PERMISSIONS.IOS.NOTIFICATIONS
          );
        }

        for (const permission of permissionsToRequest) {
          if (!permission) continue;

          const result = await check(permission);
          console.log(`Checking permission: ${permission} -> ${result}`);

          if (result !== RESULTS.GRANTED) {
            const requestResult = await request(permission);
            console.log(`Requested permission: ${permission} -> ${requestResult}`);

            if (requestResult !== RESULTS.GRANTED) {
              Alert.alert(
                'Permission Required',
                'Please enable permissions in settings for full functionality.'
              );
            }
          }
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    };

    initializeFirebase();
    requestPermissions();
  }, [isAuthenticated, loading]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Logo" component={LogoScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="HerShieldHeroes" component={HerShieldHeroes} />
        {/* <Stack.Screen name="HerShieldHeroesScreen" component={HerShieldHeroesScreen} /> */}
        <Stack.Screen name="Achievements" component={Achievements} />
        <Stack.Screen name="AchievementsScreen" component={AchievementsScreen} />
        <Stack.Screen name="EmergencyPage" component={EmergencyPageScreen} />
        <Stack.Screen name="AchievementsForm" component={AchievementsForm} />
        <Stack.Screen name="EmergencyNotifications" component={EmergencyNotificationsScreen} />
        <Stack.Screen name="FeelingUnsafe" component={FeelingUnsafe} />
        <Stack.Screen name="EmergencyInfo" component={EmergencyInfo} />
        {/* <Stack.Screen name="HelperRoute" component={HelperRoute} /> */}
        <Stack.Screen name="Marketplace" component={Marketplace} />
        <Stack.Screen name="Modules" component={Modules} />
        <Stack.Screen name="KidSafeHome" component={KidSafeHome} />
        <Stack.Screen name="KidSectionLanding" component={KidSectionLanding} />
        <Stack.Screen name="ParentLink" component={ParentLink} />
        <Stack.Screen name="KidModeScreen" component={KidModeScreen} />
<Stack.Screen name="ParentHome" component={ParentHome} />
<Stack.Screen name="Schedule" component={Schedule} />
<Stack.Screen name="GeoFence" component={GeoFence} />



      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App() {
  return (
    <LocationProvider>
    <UserProvider>
      <FeelingUnsafeProvider>
        <AppContent />
      </FeelingUnsafeProvider>
    </UserProvider>
    </LocationProvider>
  );
}

module.exports = App;
