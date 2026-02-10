const admin = require("firebase-admin");
const serviceAccount = require("../config/hershield-firebase.json");

// ✅ Only initialize if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
  
  // const sendNotification = async (token, message) => {
  //   const payload = {
  //     notification: {
  //       title: "SOS Alert",
  //       body: message,
  //     },
  //     token: token,  // User's FCM token
  //   };
  
  //   try {
  //     const response = await admin.messaging().send(payload);
  //     console.log("Notification sent:", response);
  //   } catch (error) {
  //     console.error("Error sending notification:", error);
  //   }
  // };


  const sendNotification = async (tokens,
  victimId,
  location,
  type = "NEARBY_SOS") =>
     {

  try {
    if (!tokens || tokens.length === 0) {
      console.log("❌ No FCM tokens provided");
      return;
    }

   const payload = {
   notification: {
        title: "🚨 Emergency SOS Alert",
        body: "A user near you needs help! Tap for details.",
      },

      android: {
        priority: "high",
        notification: {
          channelId: "shieldhub-alerts",
           smallIcon: "ic_notification",
          sound: "default",
          visibility: "public",
        },
      },

      data: {
        victimId: String(victimId),
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        type: String(type),
      },
    };

     // const response = await admin.messaging().send(payload);
    const response = await admin.messaging().sendEachForMulticast({
  tokens,
  ...payload,
});

    console.log("✅ SOS notification sent");
  } catch (error) {
    console.error("❌ Error sending FCM notification:", error);
  }
};


   


  module.exports = { sendNotification };