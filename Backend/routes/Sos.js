

const express = require('express');
const router = express.Router();

const Users = require('../model/Users');
const { getNearestUsers, getUserLocation } = require('../utils/Location');
const { getUserFromToken } = require('../Functions/userToken');
const { sendFCMNotification } = require('../Functions/firebaseMessaging');
const { mongoose } = require('mongoose');

router.post("/send-sos", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Location required" });
    }

    // 1️⃣ Get victim from JWT
    const decoded = getUserFromToken(req);
    if (!decoded || !decoded._id) {
  return res.status(401).json({ error: "Unauthorized: Invalid token" });
}
    const victimId = decoded._id;

    console.log("🚨 SOS triggered by:", victimId);

    // 2️⃣ Get victim location (Redis or request body)
    const location = { latitude, longitude };

    // 3️⃣ Find nearby users (Redis GEO)
    const nearby = await getNearestUsers(latitude, longitude);
    // const nearbyUserIds = nearby
    //   .map(u => u.userId)
    //   .filter(id => id !== victimId);

    const nearbyUserIds = nearby
      .map(u => u.userId)
      // .filter(id => id !== victimId.toString()) // Compare as strings
      .map(id => new mongoose.Types.ObjectId(id)); // Convert for MongoDB query


    if (!nearbyUserIds.length) {
      console.log("❌ No nearby users found");
      return res.json({ success: true, message: "No nearby users" });
    }

    // 4️⃣ Fetch FCM tokens from MongoDB
    const users = await Users.find({
      _id: { $in: nearbyUserIds },
      fcmToken: { $ne: null }
    });

    console.log(`👥 Found ${users.length} users in DB with tokens`);

    // const tokens = users.map(u => u.fcmToken);
    const tokens = users.map(u => u.fcmToken).filter(t => !!t);

    if (!tokens.length) {
      console.log("❌ No FCM tokens available");
      return res.json({ success: true, message: "No users with FCM token" });
    }

    // 5️⃣ Send notification
    await sendFCMNotification(tokens, victimId, location);

    console.log("✅ SOS notifications sent to nearby users");

    // 6️⃣ Respond ONCE
    res.json({
      success: true,
      // notifiedUsers: users.length
      notifiedUsers: tokens.length
    });

  } catch (error) {
    console.error("❌ SOS ERROR:", error);
    res.status(500).json({ error: "SOS failed" });
  }
});

module.exports = router;