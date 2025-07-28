const React = require('react');
const { createContext, useState, useEffect } = require('react');
const axios = require('axios').default;
const { getToken, saveToken, deleteToken } = require('../functions/secureStorage');
const { decodeToken } = require('../functions/token'); 
var GetLocation = require('react-native-get-location').default;
const RNAndroidLocationEnabler = require('react-native-android-location-enabler');
const {apiCall} = require('../functions/axios');
const { PermissionsAndroid ,Alert} = require('react-native');


const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [retryCount, setRetryCount] = useState(0);
  const maxRetryCount = 3;


  async function checkAndRequestLocationPermission() {
    try {
      const isGPSEnabled = await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
        interval: 10000,
        fastInterval: 5000,
      });
  
      if (!isGPSEnabled) {
        Alert.alert("⚠ GPS Required", "Please enable GPS to continue.");
        return;
      }
  
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION, // Required for background access
      ]);
  
      if (
        granted["android.permission.ACCESS_FINE_LOCATION"] === "granted" &&
        granted["android.permission.ACCESS_COARSE_LOCATION"] === "granted"
      ) {
        fetchLocation(); // Automatically fetch location after permission is granted
      } else {
        Alert.alert("⚠ Location Permission Denied", "Enable it in settings.", [
          { text: "Open Settings", onPress: () => Linking.openSettings() },
          { text: "Cancel", style: "cancel" },
        ]);
      }
    } catch (error) {
      console.error("❌ Permission Error:", error);
      Alert.alert("Error", "Something went wrong while requesting permissions.");
    }
  }
  
  async function fetchLocation() {
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });
  
      console.log("📍 Location:", location);
      setLocation(location); 
      await updateRedisLocation();
    } catch (error) {
      console.error("❌ Error fetching location:", error);
  
      if (error.code === "CANCELLED") {
        Alert.alert("⚠ Location Error", "Location request was cancelled.");
        return;
      }
  
      if (error.code === "UNAVAILABLE") {
        Alert.alert(
          "⚠ GPS is Off",
          "Please turn on GPS to get your location.",
          [
            { text: "Turn On GPS", onPress: checkAndRequestLocationPermission },
            { text: "Cancel", style: "cancel" },
          ]
        );
        return;
      }
  
      if (retryCount < maxRetryCount) {
        setRetryCount(prev => prev + 1);
        setTimeout(fetchLocation, 2000);
      }else {
        Alert.alert("⚠ Location Error", "Max retries reached. Please check GPS and try again.");
      }
    }
  }


  async function updateRedisLocation() {
    if(!location) return;
    try {
      apiCall({
        method: "PUT",
        url: "/location/update-location",
        data: { latitude: location.latitude, longitude: location.longitude },
      });
    } catch (error) {
      console.error("Error updating Redis location:", error);
    }
  }

  const loadUser = async () => {
    try {
      setLoading(true); // Start loading state
      const accessToken = await getToken('accessToken');
      const refreshToken = await getToken('refreshToken');

      if (accessToken) {
        const decoded = decodeToken(accessToken);
        if (decoded) {
          setIsAuthenticated(true);
          setUser(decoded);
          setLoading(false);
          return;
        }
      }

      // If access token is invalid, try refreshing
      if (refreshToken) {
        try {
          const response = await axios.post(`${process.env.BACKEND_URI}/refresh-token`, { refreshToken });
          const newAccessToken = response.data.accessToken;

          if (newAccessToken) {
            await saveToken('accessToken', newAccessToken);
            const decoded = decodeToken(newAccessToken);
            if (decoded) {
              setUser(decoded);
              setIsAuthenticated(true);
            } else {
              await logout(); // Invalid token → logout
            }
          }
        } catch (error) {
          console.error('Failed to refresh token:', error);
          await logout();
        }
      } else {
        await logout();
      }
    } catch (error) {
      console.error('Error loading user:', error);
      await logout();
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Load user from token storage on app start
  useEffect(() => {
    
    loadUser();
    checkAndRequestLocationPermission();
  }, []);

  // Login function
  const login = async (accessToken, refreshToken) => {
    try {
      await saveToken('accessToken', accessToken);
      await saveToken('refreshToken', refreshToken);
      const decoded = decodeToken(accessToken);
      if (decoded) {
        setUser(decoded);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  
  // Logout function
  const logout = async () => {
//     await messaging().deleteToken(); // 🧹 Delete token from FCM side
// await deleteToken('fcmToken');    // 🧹 Clear local storage
    await deleteToken('accessToken');
    await deleteToken('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
    setLocation(null);
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated, loading, login, logout ,location,setLocation}}>
      {children}
    </UserContext.Provider>
  );
};

module.exports = { UserContext, UserProvider };
