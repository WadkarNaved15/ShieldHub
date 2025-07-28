const express = require('express');
const router = express.Router();
const FeelingUnsafe = require('../model/FeelingUnsafe');
const { startNewSession, stopSession, initializeCheckIns,checkInTimers } = require('../Functions/FeelingUnsafe'); 
const { getUserFromToken } = require('../Functions/userToken');

// ✅ Get user from token

// ✅ Get Feeling Unsafe Status
router.get('/', async (req, res) => {
    const decoded = getUserFromToken(req);
    const session = await FeelingUnsafe.findOne({ user_id: decoded._id });
    console.log("session",session);
    if (session?.active) {
      return res.status(200).json({ message: 'Feeling Unsafe mode is active.', session });
    }
    if(session?.active === false){
    return res.status(200).json({ message: 'Feeling Unsafe mode is inactive.' , session });
    }
    const newSession = new FeelingUnsafe({ user_id: decoded._id, phone: decoded.phoneNumber, active: false , lastCheckIn: new Date(),interval: 3});
    await newSession.save();
    return res.status(200).json({ message: 'Feeling Unsafe mode is inactive.', session: newSession });
});

// ✅ Start Feeling Unsafe Mode
router.post('/startFeelingUnsafe', async (req, res) => {
  try {
    const { interval } = req.body;
    const decoded = getUserFromToken(req);

    const sessionData = {
      user_id: decoded._id,
      phone: decoded.phoneNumber,
      interval,
      active: true,
      lastCheckIn: new Date(),
    };

    await startNewSession(sessionData);

    res.status(200).json({ message: 'Feeling Unsafe mode activated.' });
  } catch (error) {
    console.error("Error activating Feeling Unsafe mode:", error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to activate Feeling Unsafe mode.' });
  }
});

router.post('/updateFeelingUnsafe', async (req, res) => {
  try {
    const { interval } = req.body;
    console.log("Incoming interval:", interval);

    const decoded = getUserFromToken(req);
    console.log("Decoded user from token:", decoded);

    const session = await FeelingUnsafe.findOne({ user_id: decoded._id });
    console.log("Fetched session:", session);

    if (!session) return res.status(404).json({ error: 'Session not found' });

    session.interval = interval;
    session.lastCheckIn = new Date();
    await session.save();
    console.log("Session updated and saved.");

    if (session.active) {
      console.log("Session is active, restarting session...");
      await startNewSession(session.toObject()); // 🔍 Might be the failing point
    }

    res.status(200).json({ message: 'Interval updated successfully and check-in rescheduled.' });
  } catch (error) {
    console.error('❌ Error updating interval:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to update interval.' });
  }
});



// ✅ Stop Feeling Unsafe Mode
router.post('/stopFeelingUnsafe', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);

    const session = await FeelingUnsafe.findOne({ user_id: decoded._id, active: true });
    console.log(session);
    if (!session) return res.status(404).json({ error: 'Active session not found' });

    session.active = false;
    await session.save();
    await stopSession(session.phone);

    res.status(200).json({ message: 'Feeling Unsafe mode deactivated.' });
  } catch (error) {
    console.error('Error stopping Feeling Unsafe mode:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to deactivate Feeling Unsafe mode.' });
  }
});


module.exports = router;
