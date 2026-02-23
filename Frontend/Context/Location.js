// const React = require('react');
// const {createContext, useState, useEffect} = require('react');
// const GetLocation = require('react-native-get-location').default;
// const RNAndroidLocationEnabler = require('react-native-android-location-enabler');
// const {PermissionsAndroid, Alert, Linking} = require('react-native');
// const { getToken } = require('../functions/secureStorage');
// const LocationContext = createContext();

// const apiCall = require('../functions/axios');

// const LocationProvider = ({children}) => {
//   const [location, setLocation] = useState(null);
//   const [hasPermission, setHasPermission] = useState(false);
//   const [retryCount, setRetryCount] = useState(0);
//   const [isFetching, setIsFetching] = useState(false);
//   const maxRetryCount = 3;

// // useEffect(() => {
// //   checkAndRequestLocationPermission();
// // }, []);

// //  useEffect(() => {
// //     let intervalId = null;

// //     // Only start the interval if we have permission
// //     if (hasPermission) {
// //       console.log('✅ Permission granted. Starting periodic location updates...');
      
// //       intervalId = setInterval(() => {
// //         console.log('🔁 Triggering periodic location fetch...');
// //         fetchLocation();
// //       }, 15000); // Set your desired interval here (e.g., 30000 ms = 30 seconds)
// //     }

// //     // ⚠️ Crucial: Cleanup function to stop the interval
// //     // This runs when the component unmounts or if `hasPermission` changes.
// //     return () => {
// //       if (intervalId) {
// //         clearInterval(intervalId);
// //         console.log('🛑 Stopping periodic location fetch.');
// //       }
// //     };
// //   }, [hasPermission]); 

//   async function checkAndRequestLocationPermission() {
//     try {
//       const isGPSEnabled =
//         await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
//           interval: 10000,
//           fastInterval: 5000,
//         });

//       if (!isGPSEnabled) {
//         Alert.alert('⚠ GPS Required', 'Please enable GPS to continue.');
//         return;
//       }

//       const granted = await PermissionsAndroid.requestMultiple([
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
//         PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION, // Required for background access
//       ]);

//       if (
//         granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted' &&
//         granted['android.permission.ACCESS_COARSE_LOCATION'] === 'granted'
//       ) {
//         setHasPermission(true);
//         fetchLocation(); // Automatically fetch location after permission is granted
//       } else {
//         Alert.alert('⚠ Location Permission Denied', 'Enable it in settings.', [
//           {text: 'Open Settings', onPress: () => Linking.openSettings()},
//           {text: 'Cancel', style: 'cancel'},
//         ]);
//       }
//     } catch (error) {
//       console.error('❌ Permission Error:', error);
//       Alert.alert(
//         'Error',
//         'Something went wrong while requesting permissions.',
//       );
//     }
//   }



//   async function fetchLocation() {
//     if (isFetching) return; // don’t start another request
//   setIsFetching(true);
  
//     try {
//       const location = await GetLocation.getCurrentPosition({
//         enableHighAccuracy: true,
//         timeout: 15000,
//       });

//       console.log('📍 Location provider:', location);
//       setLocation(location);
//       setRetryCount(0); // reset retry count on success
//       await updateRedisLocation(location);
     
   

    

//     } catch (error) {
//       console.error('❌ Error fetching location:', error);

//       if (error.code === 'CANCELLED') {
//         Alert.alert('⚠ Location Error', 'Location request was cancelled.');
//         return;
//       }

//       if (error.code === 'UNAVAILABLE') {
//         Alert.alert(
//           '⚠ GPS is Off',
//           'Please turn on GPS to get your location.',
//           [
//             {text: 'Turn On GPS', onPress: checkAndRequestLocationPermission},
//             {text: 'Cancel', style: 'cancel'},
//           ],
//         );
//         return;
//       }

//       if (retryCount < maxRetryCount) {
//         setRetryCount(prev => prev + 1);
//         setTimeout(fetchLocation, 2000);
//       } else {
//         Alert.alert(
//           '⚠ Location Error',
//           'Max retries reached. Please check GPS and try again.',
//         );
//       }
//     }finally {
//     setIsFetching(false);
//   }
//   }


  


//   async function updateRedisLocation(location) {
//     const token = await getToken('accessToken');
// if (!token) return;
//     if (!location) return;
//     try {
//       const response = await apiCall({
//         method: 'PUT',
//         url: '/location/update-location',
//         data: {latitude: location.latitude, longitude: location.longitude},
//       });
//       console.log('Updating Redis with location:', location);
//       console.log('✅ Location updated to Redis:', response?.data);
//     } catch (error) {
//       if (error.response) {
//     console.error('❌ Redis update failed - status:', error.response.status);
//     console.error('❌ Server response:', error.response.data);
//   } else {
//     console.error('❌ Unknown Redis update error:', error.message);
//   }
//     }
//   }

//   return (
//     <LocationContext.Provider value={{location, hasPermission, fetchLocation, checkAndRequestLocationPermission,updateRedisLocation}}>
//       {children}
//     </LocationContext.Provider>
//   );
// };

// module.exports = {LocationContext, LocationProvider};





















const React = require('react');
const {createContext, useState, useEffect, useRef} = require('react');
const GetLocation = require('react-native-get-location').default;
const RNAndroidLocationEnabler = require('react-native-android-location-enabler');
const {PermissionsAndroid, Alert, Linking} = require('react-native');
const { getToken } = require('../functions/secureStorage');
const apiCall = require('../functions/axios');

const LocationContext = createContext();

const LocationProvider = ({children}) => {
  const [location, setLocation] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const lastLocationRef = useRef(null); // Pichli location save karne ke liye
  const watchId = useRef(null);

  // Distance calculate karne ka helper (Haversine Formula)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Meters mein distance
  };

  useEffect(() => {
    checkAndRequestLocationPermission();
    return () => {
      if (watchId.current) clearInterval(watchId.current);
    };
  }, []);

  async function checkAndRequestLocationPermission() {
    // ... (aapka existing permission logic)
    setHasPermission(true);
    startTracking();
  }
  

  function startTracking() {
    if (watchId.current) return;

    watchId.current = setInterval(async () => {
      try {
        const newLoc = await GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });

        let shouldUpdate = false;

        if (!lastLocationRef.current) {
          shouldUpdate = true; // Pehli baar hamesha update karein
        } else {
          const distanceMoved = getDistance(
            lastLocationRef.current.latitude,
            lastLocationRef.current.longitude,
            newLoc.latitude,
            newLoc.longitude
          );

          // Agar user 10 meter se zyada move hua hai tabhi update karein
          if (distanceMoved > 10) {
            console.log(`🏃 User moved ${distanceMoved.toFixed(1)}m. Updating...`);
            shouldUpdate = true;
          }
        }

        if (shouldUpdate) {
          setLocation(newLoc);
          lastLocationRef.current = newLoc;
          updateRedisLocation(newLoc);
        }
      } catch (err) {
        console.log("Tracking Error:", err.message);
      }
    }, 5000); // Check har 5 sec mein hoga, lekin API tabhi chalegi jab movement ho
  }



  async function updateRedisLocation(loc) {
    const token = await getToken('accessToken');
    if (!token || !loc) return;
    try {
      await apiCall({
        method: 'PUT',
        url: '/location/update-location',
        data: {latitude: loc.latitude, longitude: loc.longitude},
      });
    } catch (error) {
      console.error('❌ Redis Update Failed');
    }
  }

  return (
    <LocationContext.Provider value={{location, hasPermission}}>
      {children}
    </LocationContext.Provider>
  );
};

module.exports = {LocationContext, LocationProvider};