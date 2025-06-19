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
        const decoded = getUserFromToken(req);
        const userId = decoded._id;

        if (!userId) return res.status(400).json({ error: "User ID required" });
        if (!longitude || !latitude) return res.status(404).json({ error: "No location found" });

        const location = await getUserLocation(userId);
        const users = await getNearestUsers(location.latitude, location.longitude);

        if (!users.length) {
            console.log("No nearby users found");
            return res.status(404).json({ message: "No nearby users found" });
        }

        // Get user IDs of nearby users (excluding the victim)
        const userIds = users.map(user => user.userId).filter(id => id !== userId);

        // Fetch FCM tokens from Redis for these users
        const tokens = await client.hmget("fcm_tokens", userIds);

        // Remove null or undefined tokens
        const validTokens = tokens.filter(token => token !== null);

        if (validTokens.length === 0) {
            console.log("No valid FCM tokens found");
            return res.status(404).json({ message: "No valid FCM tokens found" });
        }

        // Send FCM notification
        await sendFCMNotification(validTokens, userId, location);

        res.json({ success: true, message: "SOS Sent", users });

    } catch (error) {
        console.error("Error sending SOS:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;
