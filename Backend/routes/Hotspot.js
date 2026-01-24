const express = require("express");
const Hotspot = require("../model/Hotspot");
const router = express.Router();

// Add a hotspot manually
router.post("/add", async (req, res) => {
  try {
    const { latitude, longitude, severity } = req.body;
    const hotspot = new Hotspot({ latitude, longitude, severity });
    await hotspot.save();
    res.status(201).json({ message: "Hotspot saved", hotspot });
  } catch (error) {
    console.log("Error from hotspot add :", error)
    res.status(500).json({ error: "Failed to save hotspot" });
  }
});

// Get all hotspots
router.get("/get", async (req, res) => {
  try {
    const hotspots = await Hotspot.find();
    res.json(hotspots);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch hotspots" });
  }
});

module.exports = router;
