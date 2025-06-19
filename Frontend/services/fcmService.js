const messaging = require('@react-native-firebase/messaging').default;
const firebase = require('@react-native-firebase/app').default;
const {saveToken,getToken} = require('../functions/secureStorage');
const { Alert } = require('react-native');
const apiCall = require('../functions/axios');


const BACKEND_URI =  process.env.BACKEND_URI;  // Update with your backend

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

    async getFCMToken() {
        try {
            const newToken = await messaging().getToken();
            const storedToken = await getToken('fcmToken');
    
            console.log("New FCM Token:", newToken);
            console.log("Stored FCM Token:", storedToken);
    
            if (!storedToken || storedToken !== newToken) {
                console.log("🔄 Updating FCM Token...");
                await saveToken('fcmToken', newToken);
                await apiCall({ url: `${BACKEND_URI}/users/fcm-token`, method: 'PUT', data: { fcm_token: newToken } });
            } else {
                console.log("FCM Token unchanged, no update needed.");
            }
        } catch (error) {
            console.error("Error getting FCM token:", error);
        }
    },

    async getStoredToken() {
        try {
            const credentials = await getToken('fcmToken');
            if (credentials) {
                console.log('Retrieved FCM Token:', credentials.password);
                return credentials.password;
            }
            return null;
        } catch (error) {
            console.error('Error retrieving FCM token:', error);
            return null;
        }
    },

    async listenForNotifications() {
        messaging().onMessage(async remoteMessage => {
            console.log('Foreground FCM Message:', remoteMessage);
            Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
        });

        messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('Background/Killed FCM Message:', remoteMessage);
        });

        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('Notification opened from background:', remoteMessage);
        });

        messaging().getInitialNotification().then(remoteMessage => {
            if (remoteMessage) {
                console.log('Notification opened from killed state:', remoteMessage);
            }
        });

        messaging().onTokenRefresh(async token => {
            console.log('FCM Token Refreshed:', token);

            // Update the new token securely in Keychain
            await saveToken('fcmToken', token);

            // Send updated token to backend
            await apiCall({ url: `${BACKEND_URI}/users/fcm-token`, method: 'PUT', data: { fcm_token: token } });
        });
    }
};

module.exports = FCMService;
