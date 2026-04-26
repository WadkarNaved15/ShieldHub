import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import notifee, { AndroidImportance, AndroidVisibility, EventType } from '@notifee/react-native';
import { SosWidget } from './Components/sosWidget';
import { registerWidgetTaskHandler } from 'react-native-android-widget';


// 1. Notifee Background Event Handler (Fixes your warning)
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  if (type === EventType.PRESS || (type === EventType.ACTION_PRESS && pressAction.id === 'accept_mission')) {
    const data = notification?.data;
    if (data?.victimId) {
      // Small delay to let the app bridge initialize
      setTimeout(() => {
        navigationService.navigate('ResponderMap', {
          victimId: data.victimId,
          initialLat: Number(data.latitude),
          initialLon: Number(data.longitude),
        });
      }, 1000);
    }
  }
  
});


const widgetTaskHandler = async (props) => {
  const widgetInfo = props.widgetInfo;
  const widgetAction = props.widgetAction;

  if (widgetAction === 'TRIGGER_SOS_ACTION') {
    // TODO: Your HerShield emergency code goes here!
    // Fetch location, send SMS via a background API, sound alarm, etc.
    console.log("SOS TRIGGERED FROM WIDGET!");
  }

  // 2. Render the widget UI
  props.renderWidget(<SosWidget />);
};

registerWidgetTaskHandler(widgetTaskHandler);

// ✅ MUST be outside App


// messaging().setBackgroundMessageHandler(async remoteMessage => {
//  console.log('📩 Background FCM:', JSON.stringify(remoteMessage));

//   // Fallback logic to ensure we get text
//   try {
//   const title = remoteMessage.notification?.title || remoteMessage.data?.title || "SOS Alert";
//   const body = remoteMessage.notification?.body || remoteMessage.data?.body || "Someone needs help";

//   await notifee.displayNotification({
//     title: title,
//     body: body,
//     android: {
//       channelId: 'shieldhub-alerts',
//       importance: AndroidImportance.HIGH,
//       visibility: AndroidVisibility.PUBLIC, // Ensures it shows on lockscreen
//         smallIcon: 'ic_notification',
//       pressAction: { id: 'default' },
//     },
//   });
//   } catch (err) {
//     console.error("❌ Background Notification Error:", err);
//   }
// });

messaging().setBackgroundMessageHandler(async remoteMessage => {
  try {
    // ONLY extract what you need
    
    const t = remoteMessage.data?.title || "SOS Alert";
    const b = remoteMessage.data?.body || "Help needed!";

    await notifee.displayNotification({
      title: t,
      body: b,
      android: {
        channelId: 'shieldhub-alerts',
        smallIcon: 'ic_launcher', // Use launcher to avoid resource-loading delay
        importance: 4, // Directly use the integer for HIGH
        pressAction: { id: 'default' },
      },
    });
  } catch (e) {}
});

AppRegistry.registerComponent(appName, () => App);
