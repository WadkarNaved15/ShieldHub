const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const Users = require('./model/Users');
const {generateAccessToken, generateRefreshToken, refreshAccessToken, verifyAccessToken, verifyRefreshToken} = require('./utils/jwt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Twilio = require('twilio');
const {parsePhoneNumberFromString} = require('libphonenumber-js');
const http = require("http");
const { processAudio, stopRecognitionStream } = require("./Functions/FeelingUnsafe");



const LocationRouter = require('./routes/Location');
const AchievementsRouter = require('./routes/Achievements');
const SosRouter = require('./routes/Sos')
const UsersRouter = require('./routes/users');
const FeelingUnsafeRouter = require('./routes/FeelingUnsafe');
const {sendOtp} = require('./utils/Twilio');
const path = require('path');
const { initializeCheckIns } = require('./Functions/FeelingUnsafe');
initializeCheckIns();
const {getIO, initializeSocket} = require('./utils/socket');

require('dotenv').config(); // To load environment variables from a .env file

const app = express();
const server = http.createServer(app);


const PORT = process.env.PORT || 3000;
initializeSocket(server); 
const io = getIO();


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  })
);

// Routes
app.use('/location', LocationRouter);
app.use('/achievements', AchievementsRouter);
app.use('/sos',SosRouter)
app.use('/users', UsersRouter);
app.use('/FeelingUnsafe', FeelingUnsafeRouter);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI,{
  serverSelectionTimeoutMS: 5000, // Increase timeout
  socketTimeoutMS: 45000,    
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

  io.on('connection', (socket) => {
    console.log('🟢 New WebSocket client connected:', socket.id);
  
    socket.on('audioData', (audioData) => {
      processAudio(socket, audioData);
    });
    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id);
    });
  });

const ngrokUrl= process.env.NGROK_URL;
const otpStore = new Map();





// Generate a 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Encrypt OTP
const encryptOtp = (otp) => {
  const key = crypto.scryptSync(process.env.OTP_SECRET, 'salt', 32); // Derive a key from the secret
  const iv = crypto.randomBytes(16); // Generate a random initialization vector
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(otp, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted; // Return IV and encrypted OTP
};

// Decrypt OTP
const decryptOtp = (encryptedOtp) => {
  const [ivHex, encrypted] = encryptedOtp.split(':');
  const key = crypto.scryptSync(process.env.OTP_SECRET, 'salt', 32);
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const generateRandomString = () => {
  return crypto.randomBytes(20).toString('hex'); 
}
const isValidPhoneNumber = (phoneNumber, countryCode) => {
  const number = parsePhoneNumberFromString(phoneNumber, countryCode);
  if (number && number.isValid() && number.nationalNumber.length === 10) {
    // Check if the number starts with 7, 8, or 9
    const validPrefix = /^[789]/.test(number.nationalNumber);
    return validPrefix;
  }else{
    return false
  }
  
};


app.get('/', (req, res) => {
  res.send('Hello, world!');
});




app.post('/send-otp', async (req, res) => {
  const { phoneNumber} = req.body;
  console.log("yfyg",phoneNumber);
  const sanitizedPhoneNumber = phoneNumber.replace(/\D/g, '');
  console.log(sanitizedPhoneNumber);

  // Validate the phone number
  if (!isValidPhoneNumber(sanitizedPhoneNumber, 'IN')) {
    return res.status(400).json({ message: 'Invalid phone number' });
  }

  // Check if user already exists
  const user = await Users.findOne({ phoneNumber: sanitizedPhoneNumber });
  if (user) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Generate OTP and encrypt it
  const otp = generateOtp();
  const encryptedOtp = encryptOtp(otp); 
  const otpCreatedAt = new Date();

  // Store OTP temporarily
  otpStore.set(sanitizedPhoneNumber, { encryptedOtp, otpCreatedAt });

 console.log(`OTP for ${sanitizedPhoneNumber}: ${otp}`);
 await sendOtp(sanitizedPhoneNumber, otp);
 res.send({ success: true, message: 'OTP sent successfully' });

//  client.messages
//   .create({
//     body: 'Hello from HerShield! Your OTP is ' + otp,
//     from: '+17743443713', // Your Twilio number
//     to: `+91${sanitizedPhoneNumber}` // Recipient's number
//   })
//   .then(message => {
//     console.log(`OTP sent to ${sanitizedPhoneNumber}: ${otp}, SID: ${message.sid}`);
//     return res.send({ success: true, message: 'OTP sent successfully' }); // Return response
//   })
//   .catch(error => {
//     console.error('Error sending message:', error);
//     if (!res.headersSent) { // Prevent duplicate response
//       return res.status(500).send({ success: false, message: 'Error sending OTP' });
//     }
//   });



});

app.post('/verify-otp', async (req, res) => {
  const { phoneNumber, otp} = req.body;
  if (!phoneNumber || !otp) return res.status(400).json({ message: 'Phone number and OTP are required' });

  const sanitizedPhoneNumber = phoneNumber.replace(/\s+/g, '');

  try {
    const storedData = otpStore.get(sanitizedPhoneNumber);
    if (!storedData) return res.status(404).json({ message: 'OTP not found. Please request a new OTP.' });

    const { encryptedOtp, otpCreatedAt } = storedData;
    const decryptedOtp = decryptOtp(encryptedOtp);

    if (new Date() - new Date(otpCreatedAt) > 5 * 60 * 1000) {
      otpStore.delete(sanitizedPhoneNumber); // Clean up expired OTP
      return res.status(401).json({ message: 'OTP expired. Please request a new OTP.' });
    }

    if (decryptedOtp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    otpStore.delete(sanitizedPhoneNumber); 


    res.send({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

  // register of new user
  app.post('/register', async (req, res) => {
    const { fullName, phoneNumber, password, gender, age } = req.body;

    // Validate input
    if (!fullName || !phoneNumber || !password || !gender || !age) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if the phone number is already registered
        const existingUser = await Users.findOne({ phoneNumber });
        if (existingUser) {
            return res.status(400).json({ message: 'Phone number already exists' });
        }

        // Hash the password using bcryptjs
        const salt = await bcrypt.genSalt(10); // Generate salt
        const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

        // Create and save the new user
        const newUser = new Users({
            fullName,
            phoneNumber,
            password: hashedPassword, // Store the hashed password
            gender,
            age,
        });

        await newUser.save();
        res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
app.all('/twiml-response', (req, res) => {  
  const language = req.query.lang || 'en'; // Default to English if no language is provided

  // Define messages in different languages (with correct pronunciation)
  const messages = {
    en: "This is a call from Her Shield. Please enter your four-digit PIN.",
    hi: "यह हर-शील्ड से कॉल है। कृपया अपना चार अंकों का पिन दर्ज करें।",
    ta: "இது ஹர் ஷீல்டிலிருந்து ஒரு அழைப்பு. உங்கள் நான்கு இலக்க குறியீட்டை உள்ளிடவும்.",
    te: "ఇది హర్ షీల్డ్ నుండి కాల్. దయచేసి మీ నాలుగు అంకెల పిన్‌ను నమోదు చేయండి.",
    bn: "এটি হার শিল্ড থেকে একটি কল। অনুগ্রহ করে আপনার চার সংখ্যার পিন লিখুন।",
    mr: "हा हर-शील्ड कडून कॉल आहे. कृपया आपला चार अंकी पिन प्रविष्ट करा."
  };

  // Define messages for "No input received"  
  const noInputMessages = {
    en: "We did not receive any input. Goodbye.",
    hi: "हमें कोई इनपुट नहीं मिला। अलविदा।",
    ta: "எங்களுக்குத் தரவு கிடைக்கவில்லை. குட்பை.",
    te: "మాకు ఎటువంటి ఇన్‌పుట్ అందలేదు. గుడ్‌బై.",
    bn: "আমরা কোনো ইনপুট পাইনি। বিদায়।",
    mr: "आम्हाला कोणताही इनपुट प्राप्त झाला नाही. गुडबाय."
  };

  // Twilio voice selection (Female voices for each language)
  const twilioVoices = {
    en: { lang: "en-US", voice: "Google.en-US-Wavenet-F" },
    hi: { lang: "hi-IN", voice: "Google.hi-IN-Wavenet-D" },
    ta: { lang: "ta-IN", voice: "Google.ta-IN-Wavenet-C" },
    te: { lang: "te-IN", voice: "Google.te-IN-Wavenet-C" },
    bn: { lang: "bn-IN", voice: "Google.bn-IN-Wavenet-C" },
    mr: { lang: "mr-IN", voice: "Google.mr-IN-Wavenet-C" }
  };

  const selectedLang = twilioVoices[language] || twilioVoices.en;
  const message = messages[language] || messages.en;
  const noInputMessage = noInputMessages[language] || noInputMessages.en;

  // **Pass lang as a query parameter in action URL**
  const actionUrl = `${ngrokUrl}/collect-pin?lang=${language}`;

  res.set('Content-Type', 'text/xml; charset=utf-8');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
      <Response>
          <Gather numDigits="4" action="${actionUrl}" method="POST">
              <Say voice="${selectedLang.voice}" language="${selectedLang.lang}">${message}</Say>
              <Pause length="2"/>
              <Say voice="${selectedLang.voice}" language="${selectedLang.lang}">${message}</Say>
              <Pause length="2"/>
              <Say voice="${selectedLang.voice}" language="${selectedLang.lang}">${message}</Say>
          </Gather>
          <Say voice="${selectedLang.voice}" language="${selectedLang.lang}">${noInputMessage}</Say>
      </Response>
  `);
});




app.post('/collect-pin', (req, res) => {
  console.log(req.body);
  const pin = req.body.Digits || null;
  console.log(`User entered PIN: ${pin}`);

  if (!pin || pin !== "1234") {
    io.emit("invalid_pin", { message: message, pin: pin });
  }
  // Read `lang` from query (sent in action URL)
  const language = req.query.lang || 'en';

  // Confirmation messages
  const messages = {
    en: "Your PIN has been received. Thank you!",
    hi: "आपका पिन प्राप्त हो गया है। धन्यवाद!",
    ta: "உங்கள் குறியீடு பெற்றுக்கொள்ளப்பட்டது. நன்றி!",
    te: "మీ పిన్ స్వీకరించబడింది. ధన్యవాదాలు!",
    bn: "আপনার পিন পাওয়া গেছে। ধন্যবাদ!",
    mr: "तुमचा पिन प्राप्त झाला आहे. धन्यवाद!"
  };

  // Twilio Female Voice selection
  const twilioVoices = {
    en: { lang: "en-US", voice: "Google.en-US-Wavenet-F" },
    hi: { lang: "hi-IN", voice: "Google.hi-IN-Wavenet-D" },
    ta: { lang: "ta-IN", voice: "Google.ta-IN-Wavenet-C" },
    te: { lang: "te-IN", voice: "Google.te-IN-Wavenet-C" },
    bn: { lang: "bn-IN", voice: "Google.bn-IN-Wavenet-C" },
    mr: { lang: "mr-IN", voice: "Google.mr-IN-Wavenet-C" }
  };

  const selectedLang = twilioVoices[language] || twilioVoices.en;
  const message = messages[language] || messages.en;

  // Handle missing PIN scenario
  const finalMessage = pin 
    ? message 
    :  " Sorry, we did not receive any PIN input.";

  res.set('Content-Type', 'text/xml; charset=utf-8');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
      <Response>
          <Say voice="${selectedLang.voice}" language="${selectedLang.lang}">${finalMessage}</Say>
      </Response>
  `);
});



// app.post('/login', async (req, res) => {
//     const { phoneNumber, password } = req.body;
//     console.log(phoneNumber, password);
//       const user = await Users.findOne({ phoneNumber :
//         phoneNumber });
//       if (!user) {
//         return res.status(400).json({ message: 'User not found' });
//       }
  
//       if(user.password !== password){
//         return res.status(400).json({ message: 'Invalid password' });
//       }
  
//       // Generate access token
//       const accessToken = generateAccessToken(user);
//       const refreshToken = generateRefreshToken(user.phoneNumber);
//       await user.save();
//       // If successful, return the user data (e.g., token generation would happen here)
//       res.status(200).json({ message: 'Login successful', user , accessToken, refreshToken});
//   });
// 

app.post('/login', async (req, res) => {
  const { phoneNumber, password } = req.body;

  console.log(phoneNumber, password);

  if (!phoneNumber || !password) {
      return res.status(400).json({ message: 'Phone number and password are required' });
  }

  try {
      // Find the user by phone number
      const user = await Users.findOne({ phoneNumber });
      if (!user) {
          return res.status(400).json({ message: 'User not found' });
      }

      // Compare the password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: 'Invalid password' });
      }


      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user.phoneNumber);
      await user.save();

      // If successful, return user data with tokens
      res.status(200).json({
          message: 'Login successful',
          user,
          accessToken,
          refreshToken,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});
  app.post('/refresh-token', async (req, res) => {
    const {refreshToken} = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
      const decoded = verifyRefreshToken(refreshToken);
      const user = await Users.findOne({ phoneNumber: decoded.phoneNumber });
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);
  
      res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  });

  app.put('/update-location', async (req, res) => {
    const { latitude, longitude } = req.body;
    const token = req.headers.authorization;
    
    if (token && token.startsWith('Bearer ')) {
      const extractedToken = token.split(' ')[1]; // Extract the token part after "Bearer "
      const decoded = verifyAccessToken(extractedToken);
      const user = await Users.findByIdAndUpdate(
        decoded._id,
        {
            current_location: {
                type: 'Point',
                coordinates: [longitude, latitude],
            },
        },
        { new: true } // Return the updated document
    );

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Location updated successfully', user });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
  });
// Start the server
server.listen(PORT,"0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
