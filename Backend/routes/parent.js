// routes/parent.js
const express = require('express');
const router = express.Router();
const User = require('../model/Users');
const auth = require('../middleware/auth');
const redis = require('../utils/Redis'); // or wherever your ioredis client is defined

// POST /parent/link-kid
router.post('/link-kid', auth, async (req, res) => {
  try {
    const parent = await User.findById(req.user._id);
    if (parent.role !== 'parent') {
      return res.status(403).json({ success: false, message: 'Only parents can link kids' });
    }

    const { kidCode } = req.body;
    if (!kidCode) {
      return res.status(400).json({ success: false, message: 'Kid code is required' });
    }

    const kid = await User.findOne({ kidCode });
    if (!kid) {
      return res.status(404).json({ success: false, message: 'Invalid kid code' });
    }

    // Prevent duplicate linking
    if (kid.parentId) {
      return res.status(409).json({ success: false, message: 'Kid already linked to a parent' });
    }

    // Link them
    kid.parentId = parent._id;
    kid.kidCode = null; // clear used code
    await kid.save();

    parent.kidIds.push(kid._id);
    await parent.save();

    res.json({ success: true, message: 'Kid linked successfully', kid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});




// GET /parent/kids
router.get('/kids', auth, async (req, res) => {
  try {
    const parent = await User.findById(req.user._id).populate('kidIds', 'fullName gender age profileImage')

    if (!parent || parent.role !== 'parent') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, kids: parent.kidIds });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});




// GET /parent/kid-location
router.get('/kid-location', auth, async (req, res) => {
  try {
    const parent = await User.findById(req.user._id);
    const kidId = parent?.connectedKidId || parent?.kidIds?.[0]; // Use first linked kid

    if (!kidId) {
      return res.json({ success: false, message: 'No kid linked' });
    }

    // Try fetching emergency location from Redis
    const data = await redis.hget(`parent-alert:${parent._id}`, 'kidLocation');

    if (data) {
      return res.json({
        success: true,
        emergencyLocation: JSON.parse(data),
      });
    }

    // Fallback: Try getting kid's current location from MongoDB
    const kid = await User.findById(kidId);
    if (kid?.currentLocation?.coordinates) {
      return res.json({
        success: true,
        fallbackLocation: {
          latitude: kid.currentLocation.coordinates[1],
          longitude: kid.currentLocation.coordinates[0],
        },
      });
    }

    return res.json({ success: false, message: 'No location data available' });

  } catch (err) {
    console.error('❌ Error in /parent/kid-location:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});





// GET /parent/kid-live-location
router.get('/kid-live-location', auth, async(req, res) => {
  // const parent = await User.findById(req.user._id);
  console.log('🔍 Query Params:', req.query);

  // const kidId = parent.connectedKidId || parent.kidId;
  const kidId = req.query.kidId;

  if (!kidId) return res.json({ success: false, message: 'No kid linked' });

  const pos = await redis.geopos('kid-locations', kidId.toString());

  if (!pos || !pos[0]) return res.json({ success: false, message: 'Location not found' });

  res.json({
    success: true,
    location: {
      latitude: pos[0][1],
      longitude: pos[0][0],
    }
  });
});



// POST /schedule/add - for parents
router.post('/schedule/create', auth, async (req, res) => {
  try {
    console.log("User from token:", req.user);

    const {  kidName,subject, startTime, endTime } = req.body;

    if (! kidName || !subject || !startTime || !endTime) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const schedule = await ClassSchedule.create({
      // userId: kidId, 
      userId: req.user._id, 
       kidName,
      subject,
      startTime,
      endTime,
      completed: false
    });

    res.json({ success: true, schedule });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;
