// routes/kid.js
const express = require('express');
const router = express.Router();
const User = require('../model/Users');
const generateKidCode = require('../utils/generateKidCode');
const auth = require('../middleware/auth'); // JWT-based auth middleware
const redis = require('../utils/Redis'); // or wherever your ioredis client is defined
const { sendNotification } = require('../utils/Notification');
const classSchedule = require('../model/classSchedule');
const ActivityLog = require('../model/ActivityLog');

// router.put('/activity/kid', auth, async (req, res) => {
//   try {
//     // Mark user as safe or checked-in (your existing logic)
//     const user = await User.findById(req.user._id);

//     // 🔽 Store log in ActivityLog
//     await ActivityLog.create({
//       userId: req.user._id,
//       type: 'check-in',
//       message: `${user.fullName} checked in at home`
//     });

//     res.json({ success: true, message: 'Check-in successful' });
//   } catch (err) {
//     console.error('Check-in error:', err);
//     res.status(500).json({ error: 'Server error during check-in' });
//   }
// });


// GET /kid/generate-code
router.get('/generate-code', auth, async (req, res) => {
  try {
    const kid = await User.findById(req.user._id);
    if (!kid) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (kid.role !== 'kid') {
      return res.status(403).json({ success: false, message: "Only kids can generate codes" });
    }

     // ✅ If code already exists, return existing
    if (kid.kidCode) {
      return res.json({ success: true, kidCode: kid.kidCode });
    }

    const code = generateKidCode();
    console.log(code)
    kid.kidCode = code;
    await kid.save();



    res.json({ success: true, kidCode: code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});




// POST /kid/regenerate-code
router.post('/regenerate-code', auth, async (req, res) => {
  try {
    const kid = await User.findById(req.user._id);
    if (!kid || kid.role !== 'kid') {
      return res.status(403).json({ success: false, message: "Only kids can regenerate codes" });
    }

    const newCode = generateKidCode();
    kid.kidCode = newCode;
    await kid.save();

    res.json({ success: true, kidCode: newCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// GET /kid/parent-info
router.get('/parent-info', auth, async (req, res) => {
  try {
    const kid = await User.findById(req.user._id).populate('parentId', 'fullName phoneNumber');
    
    if (!kid || !kid.parentId) {
      return res.json({ success: true, connected: false });
    }

    res.json({
      success: true,
      connected: true,
      parent: kid.parentId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



// PUT /kid/update-location
router.put('/update-location', auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const user = await User.findById(req.user._id);
    user.currentLocation = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
    await user.save();
    await redis.geoadd('users-location', longitude, latitude, user._id.toString());
    res.json({ success: true });
  } catch (err) {
    console.error('Location update error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});




// PUT /kid/emergency
router.put('/emergency', auth, async (req, res) => {
  const { emergency } = req.body;

  const kid = await User.findByIdAndUpdate(
    req.user._id,
    { emergency },
    { new: true } // so we get updated document
  );

  // 🔄 Then fetch the updated user (with updated location)
  const updatedKid = await User.findById(req.user._id);



   res.json({
    success: true,
    emergency: updatedKid.emergency,
    location: updatedKid.currentLocation,
  });
});



// PUT /kid/emergency-with-location

router.put('/emergency-with-location', auth, async (req, res) => {
  const { emergency, latitude, longitude } = req.body;

  const kid = await User.findById(req.user._id);
  if (!kid) return res.status(404).json({ success: false, message: "User not found" });

  kid.emergency = emergency;
  kid.currentLocation = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
  await ActivityLog.create({
  userId: req.user._id,
  type: 'emergency',
  message: `${req.user.fullName} ${emergency ? 'activated' : 'deactivated'} emergency mode`
});

  await kid.save();

  if (emergency && kid.parentId) {
    await redis.geoadd('kid-locations', longitude, latitude, kid._id.toString());

    await redis.hset(
      `parent-alert:${kid.parentId}`,
      'kidLocation',
      JSON.stringify({
        type: 'Point',
        coordinates: [longitude, latitude],
        time: Date.now(),
      })
    );

  //   // ✅ Get parent’s FCM token
  //   const parentFcmToken = await client.hget('fcm_tokens', kid.parentId.toString());

  //   // ✅ Send notification
  //   if (parentFcmToken) {
  //     const message = `🚨 Emergency! ${kid.fullName} is at https://maps.google.com/?q=${latitude},${longitude}`;
  //     await sendNotification(parentFcmToken, message);
  //   }

  }

  res.json({
    success: true,
    emergency: kid.emergency,
    location: kid.currentLocation,
  });
});





// PUT /kid/check-in
router.put('/check-in', auth, async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { lastCheckIn: new Date() });
  
await ActivityLog.create({
  userId: req.user._id,
  type: 'check-in',
  message: `${req.user.fullName} checked in at home`
});
  res.json({ success: true });
});

// PUT /kid/update-mood
router.put('/update-mood', auth, async (req, res) => {
  const { mood } = req.body;
  await User.findByIdAndUpdate(req.user._id, { mood });
  await ActivityLog.create({
  userId: req.user._id,
  type: 'mood',
  message: `${req.user.fullName} feels ${mood} today`
});

  res.json({ success: true });
});



// PUT /schedule/complete - for kids
router.put('/schedule/complete', auth, async (req, res) => {
  const { classId } = req.body;

  if (!classId) return res.status(400).json({ error: "Class ID is required" });
  const now = new Date();
  const classObj = await classSchedule.findById(classId);

  if (!classObj) return res.status(404).json({ error: "Class not found" });
  
  // Check time window
  const [startH, startM] = classObj.startTime.split(':').map(Number);
  const [endH, endM] = classObj.endTime.split(':').map(Number);
  const nowTime = now.getHours() * 60 + now.getMinutes();
  const startTime = startH * 60 + startM;
  const endTime = endH * 60 + endM;

  await ActivityLog.create({
  userId: req.user._id,
  type: 'class',
  message: `${req.user.fullName} completed class: ${classObj.subject}`
});


  if (nowTime >= startTime && nowTime <= endTime) {
    classObj.completed = true;
    await classObj.save();
    return res.json({ success: true, message: "Marked as done" });
  } else {
    return res.status(400).json({ error: "Can only be marked during class time" });
  }
});

// GET /schedule/kid - get today's schedule
router.get('/schedule/kid', auth, async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const schedule = await ClassSchedule.find({
    userId: req.user._id,
    date: { $gte: startOfDay, $lte: endOfDay }
  });
  res.json({ schedule });
});



// GET /logs/recent
// GET /kid/logs/recent
router.get('/logs/recent', auth, async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const logs = await ActivityLog.find({
      userId: req.user._id,
      createdAt: { $gte: twentyFourHoursAgo }
    })
      .sort({ createdAt: -1 })
      .limit(10);

    console.log("📄 Logs from last 24 hrs being sent:", logs);
    res.json({ logs });
  } catch (err) {
    console.error("Error fetching recent logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});



module.exports = router;
