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





// GET /parent/kid-location/:kidId
router.get('/kid-location/:kidId', auth, async (req, res) => {
  try {
    const parent = await User.findById(req.user._id);

    if (!parent || parent.role !== 'parent') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { kidId } = req.params;

    // Check if this kid is linked to the parent
    if (!parent.kidIds.includes(kidId)) {
      return res.status(403).json({ success: false, message: 'This kid is not linked to you' });
    }

    // Fetch from Redis
    const location = await redis.geopos('kid-locations', kidId);

    if (!location || !location[0]) {
      return res.status(404).json({ success: false, message: 'Location not found for this kid' });
    }

    const [longitude, latitude] = location[0];

    res.json({
      success: true,
      kidId,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



module.exports = router;
