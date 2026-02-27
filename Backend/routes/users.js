const express = require('express');
const router = express.Router();
const client = require("../utils/Redis");   
const {verifyAccessToken} = require("../utils/jwt")
const {getUser} = require("../utils/users");
const Users = require("../model/Users");
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



// GET USER BY ID
router.get('/:id', async (req, res) => {
   console.log('🧪 users route HIT with ID:', req.params.id);
  try {
    const user = await Users.findById(req.params.id).select(
      'fullName phoneNumber role'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('❌ Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



router.put("/fcm-token", async (req, res) => {
  try {
    const { fcm_token } = req.body;
    const decoded = getUserFromToken(req);
    const userId = decoded._id;

    if (!userId || !fcm_token) {
      return res.status(400).json({ error: "Invalid data" });
    }

    // 1️⃣ Save to MongoDB (SOURCE OF TRUTH)
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.fcmToken = fcm_token;
    await user.save();

    // 2️⃣ Save to Redis (CACHE – OPTIONAL)
    await client.hset("fcm_tokens", userId.toString(), fcm_token);

    console.log("✅ FCM token saved:");
    console.log("   MongoDB → Users.fcmToken");
    console.log("   Redis   → fcm_tokens:", userId);

    // 3️⃣ Respond ONCE
    res.json({ success: true });

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