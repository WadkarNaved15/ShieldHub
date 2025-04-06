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

router.put("/update-location", async (req, res) => {
    const { latitude, longitude } = req.body;
    const decoded = getUserFromToken(req);
    const userId = decoded._id;
    console.log(userId,latitude,longitude);
    if (!userId || !latitude || !longitude) return res.status(400).json({ error: "Invalid data" });

    const data =await updateUserLocation(userId,longitude,latitude);
    console.log(data);
    res.json({ success: true, message: "Location updated" });
} );

module.exports = router;


