const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth'); // if using JWT
const GeoFence = require('../model/Geofence');

// POST /api/geofence/create
// POST /goegfence
router.post('/create', auth, async (req, res) => {
  try {
   const { label, latitude, longitude, radius, kid  } = req.body;

    const parentId = req.user._id;
    console.log(parentId);

const geofence = new GeoFence({ label, latitude, longitude, radius, kid, parentId });

    await geofence.save();
     console.log('Received geofence:', { latitude, longitude, radius, label, kid });

    res.status(201).json({ message: 'Geofence created successfully', geofence });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create geofence' });
  }
});

// GET /api/geofence/all
router.get('/all', auth, async (req, res) => {
  try {
    const geofences = await GeoFence.find({ parentId: req.user.id });
    res.json({ geofences });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch geofences' });
  }
});

module.exports = router;
