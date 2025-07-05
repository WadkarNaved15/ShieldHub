const admin = require("firebase-admin");
const serviceAccount = require("../config/hershield-firebase.json");

// ✅ Only initialize if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
  
  const sendNotification = async (token, message) => {
    const payload = {
      notification: {
        title: "SOS Alert",
        body: message,
      },
      token: token,  // User's FCM token
    };
  
    try {
      const response = await admin.messaging().send(payload);
      console.log("Notification sent:", response);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  module.exports = { sendNotification };