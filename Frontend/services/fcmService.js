import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Linking, Alert } from 'react-native';
// import { BACKEND_URI } from '@env';
// Sabko ek hi style mein rakhein
const messaging = require('@react-native-firebase/messaging').default;
const { saveToken, getToken } = require('../functions/secureStorage');
const apiCall = require('../functions/axios');
const navigationService = require('./navigationService'); 

let listenersInitialized = false;

// const BACKEND_URI =  process.env.BACKEND_URI;  // Update with your backend
// --- FOREGROUND LISTENER ---
// 1. Foreground Listener ko function ke andar le aayein taaki scope sahi rahe
const setupForegroundListener = () => {
  notifee.onForegroundEvent(({ type, detail }) => {
    const { notification, pressAction } = detail;
    const data = notification?.data;
    console.log('🔔 Notification data:', data);

    // if (!data || data.screen !== 'ResponderMap') return;
     if (!data || !data.victimId) return; // ✅ relaxed check

    if (
      type === EventType.PRESS ||
      (type === EventType.ACTION_PRESS && pressAction.id === 'accept_mission')
    ) {
      navigationService.navigate('ResponderMap', {
  victimId: data.victimId,
  // victimName: data.victimName,
  initialLat: Number(data.latitude),   // ✅ MATCH REAL KEYS
        initialLon: Number(data.longitude),

        phoneNumber: data.phoneNumber // ✅ Pass phone number to map
});
    }

    if (type === EventType.ACTION_PRESS && pressAction.id === 'call_police') {
      Linking.openURL('tel:100');
    }
  });
};

// let navigationRef = null;



const FCMService = {

  // Add this new method
  // setNavigation(ref) {
  //   navigationRef = ref;
  // },

    async requestPermission() {
        try {
            console.log("messaging",messaging)
            // console.log("firebase",firebase)
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                console.log('FCM Permission granted.');
            } else {
                console.log('FCM Permission denied.');
            }
        } catch (error) {
            console.error('Error requesting FCM permission:', error);
        }
    },


//     async getFCMToken() {
//         try {
//             const newToken = await messaging().getToken();
//             const storedToken = await getToken('fcmToken');
    
//             console.log("New FCM Token:", newToken);
//             console.log("Stored FCM Token:", storedToken);
    
//             if (!storedToken || storedToken !== newToken) {
//                 console.log("🔄 Updating FCM Token...");
//                 await saveToken('fcmToken', newToken);
//                 // await apiCall({ url: `${BACKEND_URI}/users/fcm-token`, method: 'PUT', data: { fcm_token: newToken } });
//                 await apiCall({ url: '/users/fcm-token', method: 'PUT', data: { fcm_token: newToken } });
// console.log("📥 Backend response for FCM save:", response);
//             } else {
//                 console.log("FCM Token unchanged, no update needed.");
//             }
//         } catch (error) {
//             console.error("Error getting FCM token:", error);
//         }
//     },


async getFCMToken() {
  try {
    const newToken = await messaging().getToken();
    const storedToken = await getToken('fcmToken');

    console.log("New FCM Token:", newToken);
    console.log("Stored FCM Token:", storedToken);

    await saveToken('fcmToken', newToken); // save locally anyway

    console.log("🔄 Sending FCM token to backend...");
    const response = await apiCall({
      url: '/users/fcm-token',
      method: 'PUT',
      data: { fcm_token: newToken },
    });
    console.log("📥 Backend response:", response);
  } catch (error) {
    console.error("Error syncing FCM token:", error);
  }
},






    // async getStoredToken() {
    //     try {
    //         const credentials = await getToken('fcmToken');
    //         if (credentials) {
    //             console.log('Retrieved FCM Token:', credentials.password);
    //             return credentials.password;
    //         }
    //         return null;
    //     } catch (error) {
    //         console.error('Error retrieving FCM token:', error);
    //         return null;
    //     }
    // },



    async getStoredToken() {
  try {
    const token = await getToken('fcmToken');
    if (token) {
      console.log('Retrieved FCM Token:', token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving FCM token:', error);
    return null;
  }
},



async listenForNotifications() {
  console.log('🛠️ Attempting to initialize FCM Listeners...');
// Alert.alert("Debug", "listenForNotifications has started!");

  if (listenersInitialized) {
    console.log('🔁 Listeners already active, skipping...');
    return;
  }
  listenersInitialized = true;

  setupForegroundListener();

  await notifee.deleteChannel('shieldhub-alerts');
  // 1. Create the channel first!
  try {
    console.log('📺 Creating Notifee Channel...');
    const channelId = await notifee.createChannel({
      id: 'shieldhub-alerts',
      name: 'Emergency Alerts',
      importance: AndroidImportance.HIGH,
      sound: 'siren',
      vibration: true,
    });
    console.log('✅ Channel Created/Verified:', channelId);
  } catch (channelError) {
    console.error('❌ Channel Creation Failed:', channelError);
  }

 messaging().onMessage(async remoteMessage => {
  console.log('📩 Foreground FCM Received:', JSON.stringify(remoteMessage, null, 2));

  try {
    // Strict null checks to prevent passing undefined values to Notifee
    const title = remoteMessage.data?.title || remoteMessage.notification?.title || "Emergency SOS";
    const body = remoteMessage.data?.body || remoteMessage.notification?.body || "A user near you needs help!";

   await notifee.displayNotification({
  title: '🚨 Emergency SOS Alert! 🚨',
  body: 'A user near you needs immediate help.',
  // data: { 
  //   victimId: '...', // Make sure this is passed from FCM
  //   screen: 'ResponderMap' 
  // },
  data: remoteMessage.data, // ✅ VERY IMPORTANT
  android: {
    channelId: 'shieldhub-alerts',
    importance: AndroidImportance.HIGH,
    sound: 'siren',
    pressAction: { id: 'default' }, // Tapping the notification body
    actions: [
      {
        title: '🏃 I am Coming',
        pressAction: { 
          id: 'accept_mission', 
          launchActivity: 'default' // 👈 MANDATORY for the button to show
        },
      },
      {
        title: '📞 Inform Police',
        pressAction: { 
          id: 'call_police' 
        },
      },
    ],
  },
});
  } catch (err) {
    console.error("❌ Notifee Display Error:", err);
  }
});

// Add this inside listenForNotifications()
// notifee.onForegroundEvent(({ type, detail }) => {
//  if (type === EventType.PRESS) {
//     console.log('User pressed the notification in foreground', detail.notification);
    
//     const data = detail.notification?.data;
//     if (data?.screen === 'ResponderMap') {
//       // Use your navigation reference to move to the map
//       navigationRef.navigate('ResponderMap', {
//         victimId: data.victimId,
//        initialLat: data.latitude, // Use the keys from your log: 'latitude'
//          initialLon: data.longitude,
//         victimName: data.victimName
//       });
//     }
//   }
// });




// notifee.onForegroundEvent(({ type, detail }) => {
//   if (type === EventType.PRESS) {
//     const data = detail.notification?.data;
//     console.log("🔔 Data from notification:", data);
    
//     console.log("🔗 Is NavigationRef null?", navigationRef === null);
//     if ((data?.screen === 'ResponderMap' || data?.victimId) && navigationRef) {
//       // ✅ Wrap in a readiness check
//       if (navigationRef.isReady()) {
//         navigationRef.navigate('ResponderMap', {
//           victimId: data.victimId,
//           initialLat: data.latitude, 
//           initialLon: data.longitude,
//           victimName: data.victimName
//         });
//       } else {
//         // If not ready, wait 500ms and try once more
//         console.log("🗺️ Is NavigationRef Ready?", navigationRef?.isReady());
//         setTimeout(() => {
//           if (navigationRef.isReady()) {
//             navigationRef.navigate('ResponderMap', {
//               victimId: data.victimId,
//               initialLat: data.latitude,
//               initialLon: data.longitude,
//             });
//           }
//         }, 500);
//       }
//     }
//   }
// });

// In FCMService.js, inside the onForegroundEvent or onBackgroundEvent
// notifee.onForegroundEvent(({ type, detail }) => {
//   const { notification, pressAction } = detail;

//   if (type === EventType.ACTION_PRESS) {
//     if (pressAction.id === 'accept_mission') {
//       console.log('User clicked I am coming');
//       // Navigate to the responder screen
//       navigationService.navigate('ResponderMap', { 
//          victimId: notification.data.victimId,
//          victimName: notification.data.victimName 
//       });
//     }

//     if (pressAction.id === 'call_police') {
//       console.log('User clicked Inform Police');
//       // This opens the phone dialer with 100 pre-filled
//       Linking.openURL('tel:100');
//     }
//   }

//   // Also handle clicking the notification itself (not just the button)
//   if (type === EventType.PRESS) {
//     navigationService.navigate('ResponderMap', { 
//       victimId: notification.data?.victimId 
//     });
//   }
// });

// 1. When the app is in background but still running
messaging().onNotificationOpenedApp(remoteMessage => {
  console.log('Notification caused app to open from background:', remoteMessage.data);
  if (remoteMessage.data?.screen === 'ResponderMap') {
    navigationService.navigate('ResponderMap', {
  victimId: remoteMessage.data.victimId,
  // victimName: remoteMessage.data.victimName,
  initialLat: Number(remoteMessage.data.initialLat),
  initialLon: Number(remoteMessage.data.initialLon),
  phoneNumber: remoteMessage.data.phoneNumber
});
  }
});

// 2. When the app is completely closed (Quit state)
messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage) {
      console.log('Notification caused app to open from quit state:', remoteMessage.data);
      if (remoteMessage.data?.screen === 'ResponderMap') {
        // You might need a small delay or check if navigation is ready
        setTimeout(() => {
          navigationService.navigate('ResponderMap', {
  victimId: remoteMessage.data.victimId,
  // victimName: remoteMessage.data.victimName,
  initialLat: Number(remoteMessage.data.initialLat),
  initialLon: Number(remoteMessage.data.initialLon),
  phoneNumber: remoteMessage.data.phoneNumber
});
        }, 500);
      }
    }
  });


}




};


module.exports = FCMService;
