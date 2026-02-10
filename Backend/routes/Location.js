const express = require("express");
const {decodeToken,verifyAccessToken}= require("../utils/jwt");
// import { tryCatchWrapper } from "../utils/Functions.js";
const { getNearbyUsers,getUserLocation,updateUserLocation} = require("../utils/Location.js");
const {getUserFromToken} = require("../Functions/userToken");

const router = express.Router();


router.post("/nearby-Users", (req, res) => { 
    const { latitude, longitude, radiusInKm = 5 } = req.body;
    getNearbyUsers(latitude, longitude, radiusInKm)
    .then((nearbyUsers) => res.json(nearbyUsers))
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.get('/kid-location/:kidId', async (req, res) => {
  try {
    // 1. Get the kid's ID from the URL parameters
    const { kidId } = req.params;
    if (!kidId) {
      return res.status(400).json({ success: false, message: 'Kid ID is required.' });
    }

    // 2. Call the function to fetch the location from Redis
    const location = await getKidLocation(kidId);

    // 3. Handle the response
    if (location) {
      // ✅ Success: Location was found
      res.status(200).json({
        success: true,
        location: location
      });
    } else {
      // ⚠️ Not Found: The kid's ID is not in our Redis geo index
      res.status(404).json({
        success: false,
        message: 'Location for the specified kid not found.'
      });
    }
  } catch (error) {
    // ❌ Server Error: Something went wrong (e.g., Redis connection issue)
    console.error(`Error on GET /kid-location/${req.params.kidId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// router.put("/update-location", async (req, res) => {
//   try {
//     const { latitude, longitude } = req.body;
//     const decoded = getUserFromToken(req);
//     console.log("🧠 Decoded user:", decoded);

//     if (!decoded || !decoded._id)
//       return res.status(401).json({ error: "Unauthorized or invalid token" });

//     const userId = decoded._id;

//     if (!userId || !latitude || !longitude)
//       return res.status(400).json({ error: "Missing location or userId" });

//     const data = await updateUserLocation(userId, longitude, latitude);

//     console.log("✅ Redis geoadd response:", data);
//     res.json({ success: true, message: "Location updated" });

//   } catch (err) {
//     console.error("❌ Error in /update-location:", err);
//     res.status(500).json({ error: "Internal server error", details: err.message });
//   }
// });


router.put('/update-location', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    console.log('📦 Incoming payload:', req.body);

     let decoded;
    try {
      decoded = getUserFromToken(req); // catch error here
    } catch (err) {
      console.error("⛔ Auth error:", err);
      return res.status(err.status || 401).json({ error: err.message || "Unauthorized" });
    }
    
    console.log('🧠 Decoded token:', decoded);

    if (!decoded || !decoded._id) {
      return res.status(401).json({ error: 'Invalid or missing token' });
    }

    const userId = decoded._id;
    if (!userId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing data' });
    }

    const redisResp = await updateUserLocation(userId, longitude, latitude);
    console.log('✅ Redis geoadd success:', redisResp);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Server Crash in /update-location:', err.stack || err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});



module.exports = router;


