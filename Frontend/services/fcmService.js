const messaging = require('@react-native-firebase/messaging').default;
const firebase = require('@react-native-firebase/app').default;
const {saveToken,getToken} = require('../functions/secureStorage');
const { Alert } = require('react-native');
const apiCall = require('../functions/axios');
import notifee, { AndroidImportance } from '@notifee/react-native';

const BACKEND_URI =  process.env.BACKEND_URI;  // Update with your backend

let listenersInitialized = false;
const FCMService = {

    async requestPermission() {
        try {
            console.log("messaging",messaging)
            console.log("firebase",firebase)
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



// async getFCMToken() {
//   try {
//     // Force generate a new token on login
//     await messaging().deleteToken(); // 💥 This clears any previous token
    
//     const freshToken = await messaging().getToken(); // 🆕 New token for this user
//     console.log("🎯 Fresh FCM Token:", freshToken);
    
//     await saveToken('fcmToken', freshToken); // secure local storage

//     // Send to backend with current JWT in header
//     await apiCall({ url: '/users/fcm-token', method: 'PUT', data: { fcm_token: freshToken } });

//   } catch (error) {
//     console.error("❌ Error getting FCM token:", error);
//   }
// },




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

//     async listenForNotifications() {
//         // messaging().onMessage(async remoteMessage => {
//         //     console.log('Foreground FCM Message:', remoteMessage);
//         //     Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
//         // });



//         // messaging().setBackgroundMessageHandler(async remoteMessage => {
//         //     console.log('Background/Killed FCM Message:', remoteMessage);
//         // });



//         messaging().onMessage(async remoteMessage => {
//   console.log('Foreground FCM Message:', JSON.stringify(remoteMessage, null, 2));

//   if (remoteMessage.notification) {
//     Alert.alert(
//       remoteMessage.notification.title ?? 'Alert',
//       remoteMessage.notification.body ?? 'You have a new message'
//     );
//   } else if (remoteMessage.data?.type === 'NEARBY_SOS') {
//     Alert.alert(
//       '🚨 Emergency SOS Alert',
//       'A user near you needs help!'
//     );
//   }
// });

//         messaging().onNotificationOpenedApp(remoteMessage => {
//             console.log('Notification opened from background:', remoteMessage);
//         });

//         messaging().getInitialNotification().then(remoteMessage => {
//             if (remoteMessage) {
//                 console.log('Notification opened from killed state:', remoteMessage);
//             }
//         });

//         messaging().onTokenRefresh(async token => {
//             console.log('FCM Token Refreshed:', token);

//             // Update the new token securely in Keychain
//             await saveToken('fcmToken', token);

//             // Send updated token to backend
//             // await apiCall({ url: `${BACKEND_URI}/users/fcm-token`, method: 'PUT', data: { fcm_token: token } });
//                 await apiCall({ url: '/users/fcm-token', method: 'PUT', data: { fcm_token: token } });

//         });
//     }







// async listenForNotifications() {
//   if (listenersInitialized) {
//     console.log('🔁 FCM listeners already initialized');
//     return;
//   }
//   listenersInitialized = true;

//   messaging().onMessage(async remoteMessage => {
//     console.log('Foreground FCM Message:', JSON.stringify(remoteMessage, null, 2));

//     if (remoteMessage.notification) {
//       Alert.alert(
//         remoteMessage.notification.title ?? 'Alert',
//         remoteMessage.notification.body ?? 'You have a new message'
//       );
//     } else if (remoteMessage.data?.type === 'NEARBY_SOS') {
//       Alert.alert(
//         '🚨 Emergency SOS Alert',
//         'A user near you needs help!'
//       );
//     }
//   });

//   messaging().onNotificationOpenedApp(remoteMessage => {
//     console.log('Notification opened from background:', remoteMessage);
//   });

//   messaging().getInitialNotification().then(remoteMessage => {
//     if (remoteMessage) {
//       console.log('Notification opened from killed state:', remoteMessage);
//     }
//   });

//   messaging().onTokenRefresh(async token => {
//     console.log('FCM Token Refreshed:', token);
//     await saveToken('fcmToken', token);
//     await apiCall({ url: '/users/fcm-token', method: 'PUT', data: { fcm_token: token } });
//   });
// }







// async listenForNotifications() {
//   if (listenersInitialized) return;
//   listenersInitialized = true;

//   messaging().onMessage(async remoteMessage => {
//     console.log('📩 Foreground FCM:', remoteMessage.data);

//     await notifee.displayNotification({
//       title: remoteMessage.data.title,
//       body: remoteMessage.data.body,
//       android: {
//         channelId: 'shieldhub-alerts',
//         importance: notifee.AndroidImportance.HIGH,
//         pressAction: {
//           id: 'default',
//         },
//       },
//     });
//   });
// }


async listenForNotifications() {
  console.log('🛠️ Attempting to initialize FCM Listeners...');
Alert.alert("Debug", "listenForNotifications has started!");

  if (listenersInitialized) {
    console.log('🔁 Listeners already active, skipping...');
    return;
  }
  listenersInitialized = true;

  // 1. Create the channel first!
  try {
    console.log('📺 Creating Notifee Channel...');
    const channelId = await notifee.createChannel({
      id: 'shieldhub-alerts',
      name: 'Emergency Alerts',
      importance: AndroidImportance.HIGH,
      sound: 'default',
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
      title: title,
      body: body,
      android: {
        channelId: 'shieldhub-alerts', // Must match the registered category
        importance: AndroidImportance.HIGH,
        priority: 'high',
        pressAction: { id: 'default' },
      },
    });
  } catch (err) {
    console.error("❌ Notifee Display Error:", err);
  }
});
}




};3


module.exports = FCMService;
