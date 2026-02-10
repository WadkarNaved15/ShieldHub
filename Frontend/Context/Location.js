// const React = require('react');
// const {createContext, useState, useEffect} = require('react');
// const GetLocation = require('react-native-get-location').default;
// const RNAndroidLocationEnabler = require('react-native-android-location-enabler');
// const {PermissionsAndroid, Alert, Linking} = require('react-native');

// const LocationContext = createContext();

// const apiCall = require('../functions/axios');

// const LocationProvider = ({children}) => {
//   const [location, setLocation] = useState(null);
//   const [hasPermission, setHasPermission] = useState(false);
//   const [retryCount, setRetryCount] = useState(0);
//   const [isFetching, setIsFetching] = useState(false);
//   const maxRetryCount = 3;

// useEffect(() => {
//   checkAndRequestLocationPermission();
// }, []);

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

//   // useEffect(() => {
//   //   let intervalId = null;

//   //   // Only start the interval if we have permission
//   //   if (hasPermission) {
//   //     console.log('✅ Permission granted. Starting periodic location updates...');
      
//   //     intervalId = setInterval(() => {
//   //       console.log('🔁 Triggering periodic location fetch...');
//   //       fetchLocation();
//   //     }, 15000); // Set your desired interval here (e.g., 30000 ms = 30 seconds)
//   //   }

//   //   // ⚠️ Crucial: Cleanup function to stop the interval
//   //   // This runs when the component unmounts or if hasPermission changes.
//   //   return () => {
//   //     if (intervalId) {
//   //       clearInterval(intervalId);
//   //       console.log('🛑 Stopping periodic location fetch.');
//   //     }
//   //   };
//   // }, [hasPermission]);


//  async function fetchLocation() {
  

//   try {
//     const location = await GetLocation.getCurrentPosition({
//       enableHighAccuracy: true,
//       timeout: 15000,
//     });

//     console.log('📍 Location provider:', location);
//     setLocation(location);
//     setRetryCount(0); // reset retry count on success
//     await updateRedisLocation(location);

//   } catch (error) {
//     console.error('❌ Error fetching location:', error);

//     if (error.code === 'CANCELLED') {
//       Alert.alert('⚠ Location Error', 'Location request was cancelled.');
//       // No return needed here if we handle isFetching in finally
//     } else if (error.code === 'UNAVAILABLE') {
//       Alert.alert(
//         '⚠ GPS is Off',
//         'Please turn on GPS to get your location.',
//         [
//           { text: 'Turn On GPS', onPress: checkAndRequestLocationPermission },
//           { text: 'Cancel', style: 'cancel' },
//         ],
//       );
//       // No return needed here
//     } else if (retryCount < maxRetryCount) {
//       setRetryCount(prev => prev + 1);
//       setTimeout(fetchLocation, 2000);
//       // We return here so `setIsFetching(false)` isn't called immediately,
//       // as another fetch is about to start.
//       return; 
//     } else {
//       Alert.alert(
//         '⚠ Location Error',
//         'Max retries reached. Please check GPS and try again.',
//       );
//     }
//   } finally {
//     // This will run after success or any error that doesn't retry.
//     setIsFetching(false);
//   }
// }


  


//   async function updateRedisLocation(location) {
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
const {createContext, useState, useEffect} = require('react');
const GetLocation = require('react-native-get-location').default;
const RNAndroidLocationEnabler = require('react-native-android-location-enabler');
const {PermissionsAndroid, Alert, Linking} = require('react-native');
const { getToken } = require('../functions/secureStorage');
const LocationContext = createContext();

const apiCall = require('../functions/axios');

const LocationProvider = ({children}) => {
  const [location, setLocation] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const maxRetryCount = 3;

// useEffect(() => {
//   checkAndRequestLocationPermission();
// }, []);

//  useEffect(() => {
//     let intervalId = null;

//     // Only start the interval if we have permission
//     if (hasPermission) {
//       console.log('✅ Permission granted. Starting periodic location updates...');
      
//       intervalId = setInterval(() => {
//         console.log('🔁 Triggering periodic location fetch...');
//         fetchLocation();
//       }, 15000); // Set your desired interval here (e.g., 30000 ms = 30 seconds)
//     }

//     // ⚠️ Crucial: Cleanup function to stop the interval
//     // This runs when the component unmounts or if `hasPermission` changes.
//     return () => {
//       if (intervalId) {
//         clearInterval(intervalId);
//         console.log('🛑 Stopping periodic location fetch.');
//       }
//     };
//   }, [hasPermission]); 

  async function checkAndRequestLocationPermission() {
    try {
      const isGPSEnabled =
        await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
          interval: 10000,
          fastInterval: 5000,
        });

      if (!isGPSEnabled) {
        Alert.alert('⚠ GPS Required', 'Please enable GPS to continue.');
        return;
      }

      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION, // Required for background access
      ]);

      if (
        granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted' &&
        granted['android.permission.ACCESS_COARSE_LOCATION'] === 'granted'
      ) {
        setHasPermission(true);
        fetchLocation(); // Automatically fetch location after permission is granted
      } else {
        Alert.alert('⚠ Location Permission Denied', 'Enable it in settings.', [
          {text: 'Open Settings', onPress: () => Linking.openSettings()},
          {text: 'Cancel', style: 'cancel'},
        ]);
      }
    } catch (error) {
      console.error('❌ Permission Error:', error);
      Alert.alert(
        'Error',
        'Something went wrong while requesting permissions.',
      );
    }
  }



  async function fetchLocation() {
    if (isFetching) return; // don’t start another request
  setIsFetching(true);
  
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });

      console.log('📍 Location provider:', location);
      setLocation(location);
      setRetryCount(0); // reset retry count on success
      await updateRedisLocation(location);
     
   

    

    } catch (error) {
      console.error('❌ Error fetching location:', error);

      if (error.code === 'CANCELLED') {
        Alert.alert('⚠ Location Error', 'Location request was cancelled.');
        return;
      }

      if (error.code === 'UNAVAILABLE') {
        Alert.alert(
          '⚠ GPS is Off',
          'Please turn on GPS to get your location.',
          [
            {text: 'Turn On GPS', onPress: checkAndRequestLocationPermission},
            {text: 'Cancel', style: 'cancel'},
          ],
        );
        return;
      }

      if (retryCount < maxRetryCount) {
        setRetryCount(prev => prev + 1);
        setTimeout(fetchLocation, 2000);
      } else {
        Alert.alert(
          '⚠ Location Error',
          'Max retries reached. Please check GPS and try again.',
        );
      }
    }finally {
    setIsFetching(false);
  }
  }


  


  async function updateRedisLocation(location) {
    const token = await getToken('accessToken');
if (!token) return;
    if (!location) return;
    console.log('Attempting to update Redis with location:', location);
    try {
      const response = await apiCall({
        method: 'PUT',
        url: '/location/update-location',
        data: {latitude: location.latitude, longitude: location.longitude},
      });
      console.log('Updating Redis with location:', location);
      console.log('✅ Location updated to Redis:', response?.data);
    } catch (error) {
      if (error.response) {
    console.error('❌ Redis update failed - status:', error.response.status);
    console.error('❌ Server response:', error.response.data);
  } else {
    console.error('❌ Unknown Redis update error:', error.message);
  }
    }
  }

  return (
    <LocationContext.Provider value={{location, hasPermission, fetchLocation, checkAndRequestLocationPermission,updateRedisLocation}}>
      {children}
    </LocationContext.Provider>
  );
};

module.exports = {LocationContext, LocationProvider};
















