const admin = require("firebase-admin");
const serviceAccount = require("../hershield-47214-firebase-adminsdk-fbsvc-7fa16ff798.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
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