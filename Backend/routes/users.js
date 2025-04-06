const express = require('express');
const router = express.Router();
const client = require("../utils/Redis");   
const {verifyAccessToken} = require("../utils/jwt")
const {getUser} = require("../utils/users");
const User = require("../model/Users");
const Achievements = require("../model/Achievements");
const {getUserFromToken} = require("../Functions/userToken");

router.put("/fcm-token", async (req, res) => {
    const { fcm_token } = req.body;
        const decoded = getUserFromToken(req);
        const userId = decoded._id;
    if (!userId || !fcm_token) return res.status(400).json({ error: "Invalid data" });
    try {
        await client.hset("fcm_tokens", userId, fcm_token);
        res.json({ success: true, message: "FCM token saved successfully" });
    } catch (error) {
        console.error("Error saving FCM token:", error);
        res.status(500).json({ error: "Error saving FCM token" });
    }}
);

router.get("/fcm-token", async (req, res) => {
    const userId = req.query.userId;
    console.log("user_id",userId)
    try {
        const token = await client.hget("fcm_tokens", userId);
        if (token) {
            res.json({ token });
        } else {
            res.status(404).json({ error: "FCM token not found" });
        }
    } catch (error) {
        console.error("Error getting FCM token:", error);
        res.status(500).json({ error: "Error getting FCM token" });
    }
});

router.get('/achievements/:user_id', async (req, res) => {
    try {
        const userId = req.params.user_id;

        // Fetch user and populate achievements
        const user = await User.findById(req.params.user_id)
        .populate('achievements.achievementId') // ✅ Populate achievementId
        .exec();
      

        console.log("user",user)
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ data:user.achievements }); // Send achievements directly
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
    // async function addAchievement(userId, achievementId) {
    //     try {
    //       const result = await User.updateOne(
    //         { _id: userId }, 
    //         { 
    //           $addToSet: { 
    //             achievements: { 
    //               achievementId: achievementId, 
    //               dateEarned: new Date() // Automatically set current date
    //             } 
    //           } 
    //         }
    //       );
      
    //       console.log("Achievement Added:", result);
    //     } catch (error) {
    //       console.error("Error updating user:", error);
    //     }
    //   }
      
    //   // Run the function with user and achievement IDs
    //   const userId = "67a309191bddd87c8842033e";  // Replace with the actual user ID
    //   const achievementId = "67c30046459ae3c6464988e1"; // Replace with the actual achievement ID
      
    //   addAchievement(userId, achievementId);
});

module.exports = router;