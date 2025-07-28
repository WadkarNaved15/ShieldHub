const express = require('express');
const router = express.Router();
const client = require("../utils/Redis");   
const {verifyAccessToken} = require("../utils/jwt")
const {getUser} = require("../utils/users");
const User = require("../model/Users");
const Achievements = require("../model/Achievements");
const {getUserFromToken} = require("../Functions/userToken");

// router.put("/fcm-token", async (req, res) => {
//   try {
//      console.log("📩 Received FCM token payload:", req.body);
//     console.log("🔐 Authorization Header:", req.headers.authorization);
//     const { fcm_token } = req.body;
//     const decoded = getUserFromToken(req); // ⛔ could throw
//     const userId = decoded._id;

//     if (!userId || !fcm_token) return res.status(400).json({ error: "Invalid data" });

//     console.log(`🔐 UserID: ${userId}, saving FCM token: ${fcm_token}`);
//     await client.hset("fcm_tokens", userId, fcm_token);
//     console.log("✅ FCM token stored successfully in Redis");

//     res.json({ success: true, message: "FCM token saved successfully" });
//   } catch (error) {
//     console.error("❌ Error saving FCM token:", error);
//     res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
//   }
// });





router.put("/fcm-token", async (req, res) => {
  const { fcm_token } = req.body;
  const decoded = getUserFromToken(req); // extract user from token
  const userId = decoded._id;

  if (!userId || !fcm_token) return res.status(400).json({ error: "Invalid data" });

  try {
    console.log(`📩 Saving FCM token for user ${userId}:`, fcm_token);

    // Optional: Clean same token from other users to avoid cross-notifications
    // const allTokens = await client.hgetall("fcm_tokens");

    // for (const [uid, token] of Object.entries(allTokens)) {
    //   if (uid !== userId && token === fcm_token) {
    //     console.log(`🧹 Removing duplicate token from user ${uid}`);
    //     await client.hdel("fcm_tokens", uid);
    //   }
    // }

    // Set current user's token
    await client.hset("fcm_tokens", userId, fcm_token);

    res.json({ success: true, message: "FCM token saved successfully" });

  } catch (error) {
    console.error("❌ Error saving FCM token:", error);
    res.status(500).json({ error: "Error saving FCM token" });
  }
});


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