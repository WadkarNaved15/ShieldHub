require("dotenv").config();
const FeelingUnsafe = require('../model/FeelingUnsafe');
const speech = require("@google-cloud/speech");
const { triggerTwilioCall, sendOtp } = require('../utils/Twilio');
const { getIO } = require('../utils/socket');

let shouldReconnect = false;

const checkInTimers = new Map(); 

const speechClient = new speech.SpeechClient({
  // keyFilename: './config/hershield-449410-ea0d1493a161.json', // Path to Google API key
  keyFilename: './config/hershield-firebase.json', // Path to Google API key

});

const EMERGENCY_PHRASES = ["help me", "please help", "emergency", "save me"];
let recognizeStream = null;


async function scheduleCheckIn(session) {
  const now = Date.now();
  const lastCheckIn = new Date(session.lastCheckIn).getTime();
  const nextCheckInTime = lastCheckIn + session.interval * 60000;
  const delay = Math.max(0, nextCheckInTime - now); // Ensure non-negative delay

  console.log(`Scheduled call for ${session.phone} in ${delay / 1000} seconds.`);

  if (checkInTimers.has(session.phone)) {
    clearTimeout(checkInTimers.get(session.phone)); // Clear any existing timer
  }

  const timer = setTimeout(async () => {
    try {
      console.log(`Calling ${session.phone}...`);
      await triggerTwilioCall(session.phone);

      session.lastCheckIn = new Date(); // Update last check-in time in memory
      await session.save().catch(err => console.error("Error saving session:", err));

      scheduleCheckIn(session); // Reschedule next check-in
    } catch (error) {
      console.error("Error in call process:", error);
    }
  }, delay);

  checkInTimers.set(session.phone, timer);
}

// Load and schedule active sessions when the server starts
async function initializeCheckIns() {
  try {
    const sessions = await FeelingUnsafe.find({ active: true });

    // Run all scheduleCheckIn() calls in parallel
    await Promise.all(sessions.map(session => scheduleCheckIn(session)));

    console.log("All check-ins initialized in parallel.");
  } catch (error) {
    console.error("Error initializing check-ins:", error);
  }
}


// Function to start a new "Feeling Unsafe" session dynamically
async function startNewSession(sessionData) {
  // ✅ Ensure only one session per phone
  await FeelingUnsafe.updateMany(
    { phone: sessionData.phone },
    { active: false }
  );

  let session = await FeelingUnsafe.findOne({ phone: sessionData.phone });

  if (session) {
    session.interval = sessionData.interval;
    session.lastCheckIn = new Date();
    session.active = true;
  } else {
    session = new FeelingUnsafe(sessionData);
  }

  await session.save();
  scheduleCheckIn(session);
}




// Function to cancel a session and clear its timer
async function stopSession(phone) {
  console.log("phone",checkInTimers.get(phone));
  if (checkInTimers.has(phone)) {
    clearTimeout(checkInTimers.get(phone));
    checkInTimers.delete(phone);
  }
  await FeelingUnsafe.findOneAndUpdate({ phone }, { active: false });
}








// Starts streaming speech recognition
function startRecognitionStream(socket) {
  const io = getIO();
  shouldReconnect = true;
  recognizeStream = speechClient
    .streamingRecognize({
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: "en-US",
        enableAutomaticPunctuation: true,
      },
      interimResults: true,
    })
    .on("data", (data) => {
      console.log("🎙️ Audio Data Received");
      const transcript = data.results[0]?.alternatives[0]?.transcript.toLowerCase() || "";
      console.log(`📝 Transcribed: ${transcript}`);

      // Check for emergency phrases
      for (let phrase of EMERGENCY_PHRASES) {
        if (transcript.includes(phrase)) {
          console.log("🚨 Emergency Detected! Sending SOS...");
          io.emit("sos_triggered");
          break;
        }
      }
    })
    .on("error", (err) => {
      console.error("❌ Speech-to-Text Error:", err);
      stopRecognitionStream();
      scheduleReconnect(socket);
    });
}


 // ✅ Add this at the top of your file

function stopRecognitionStream() {
  if (recognizeStream) {
    recognizeStream.end();
    recognizeStream = null;
  }
  shouldReconnect = false;  // ✅ Prevent further reconnection
}
// Stops the recognition stream
function stopRecognitionStream() {
  if (recognizeStream) {
    recognizeStream.end();
    recognizeStream = null;
  }
}

// Reconnects after 5 minutes
function scheduleReconnect(socket) {
  if (!shouldReconnect) return; // ✅ Stop reconnection if flag is false

  console.log("🔄 Reconnecting in 5 seconds...");
  setTimeout(() => {
    if (shouldReconnect) startRecognitionStream(socket);  // ✅ Reconnect only if allowed
  }, 5000);
}

// Handles incoming audio data
function processAudio(socket, audioData) {
  if (!recognizeStream) startRecognitionStream(socket);
  recognizeStream.write(audioData);
}




module.exports = { initializeCheckIns, startNewSession, stopSession ,processAudio,  stopRecognitionStream,checkInTimers};
