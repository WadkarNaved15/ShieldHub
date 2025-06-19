const React = require('react');
const { createContext, useState, useEffect } = require('react');
const GetLocation = require('react-native-get-location').default;
const RNAndroidLocationEnabler = require('react-native-android-location-enabler');
const { PermissionsAndroid, Alert, Linking } = require('react-native');

const LocationContext = createContext();

const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkAndRequestLocationPermission();
  }, []);

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
         setHasPermission(true);
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
   
       console.log("📍 Location provider:", location);
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

  return (
    <LocationContext.Provider value={{ location, hasPermission }}>
      {children}
    </LocationContext.Provider>
  );
};

module.exports = { LocationContext, LocationProvider };
