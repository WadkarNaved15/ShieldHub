const express = require('express');
const User = require('../model/Users');
const SOS = require('../model/Sos');
const { getNearestUsers, getUserLocation } = require('../utils/Location');
const { verifyAccessToken } = require('../utils/jwt');
const {getFcmToken} = require('../utils/users');
const {getUserFromToken} = require('../Functions/userToken');
const {sendFCMNotification} = require('../Functions/firebaseMessaging');
const client = require('../utils/Redis');


const router = express.Router();


router.post("/send-sos", async (req, res) => {
  try {
    const { longitude, latitude } = req.body;
    console.log("📍 Incoming SOS:", { latitude, longitude });

    const decoded = getUserFromToken(req);
    console.log("🔓 Decoded Token:", decoded);

    const userId = decoded._id;
    if (!userId) return res.status(400).json({ error: "User ID required" });

    if (!longitude || !latitude) return res.status(400).json({ error: "No location provided" });

    const location = await getUserLocation(userId);
    console.log("📍 User's stored location in Redis:", location);

    const users = await getNearestUsers(location.latitude, location.longitude);
    console.log("👥 Nearby users:", users);

    if (!users.length) {
      console.log("❌ No nearby users found");
      return res.status(404).json({ message: "No nearby users found" });
    }

    const userIds = users.map(u => u.userId).filter(id => id !== userId);
    console.log("🔍 User IDs to notify:", userIds);

    // 🧠 FIX: Spread the array properly in hmget
    const tokens = await client.hmget("fcm_tokens", ...userIds);
    console.log("📨 FCM tokens:", tokens);

    const validTokens = tokens.filter(token => token);
    if (!validTokens.length) {
      console.log("❌ No valid FCM tokens found");
      return res.status(404).json({ message: "No valid FCM tokens found" });
    }

    await sendFCMNotification(validTokens, userId, location);
    console.log("✅ SOS sent successfully");

    res.json({ success: true, message: "SOS sent", users });
  } catch (error) {
    console.error("❌ Error sending SOS:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;
