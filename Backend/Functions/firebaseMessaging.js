const admin = require("firebase-admin");
const serviceAccount = require("../config/hershield-449410-ea0d1493a161.json");  // Update path

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


const sendFCMNotification = async (tokens, victimId, location) => {
    try {
        const payload = {
            notification: {
                title: "🚨 Emergency SOS Alert 🚨",
                body: "A user near you needs help! Tap for details.",
                sound: "default"
            },
            data: {
                victimId: victimId,
                latitude: location.latitude,
                longitude: location.longitude,
                type: "SOS"
            }
        };
        console.log("messaging",tokens)
        await admin.messaging().sendEachForMulticast({ tokens, ...payload });

        console.log("SOS Notification Sent to Nearby Users");

    } catch (error) {
        console.error("Error sending FCM Notification:", error);
    }
};

module.exports = { sendFCMNotification };