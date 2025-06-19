const Twilio = require('twilio');
require('dotenv').config();

const ngrokUrl= process.env.NGROK_URL;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = Twilio(accountSid, authToken);

const triggerTwilioCall = async (phone) => {
    try {
      await client.calls
      .create({
        url: `${ngrokUrl}/twiml-response?lang=en`,  // TwiML URL for the call
        from: `+${twilioNumber}`,  // Replace with the recipient's phone number
        to:`+91${phone}` // Replace with your Twilio number
      })
      .then(call => console.log(`Call SID: ${call.sid}`))
      .catch(err => console.error(err));
      console.log(`Automated call triggered for ${phone}`);
    } catch (error) {
      console.error('Failed to trigger Twilio call:', error);
    }
  };

  const sendOtp = async (phone, otp) => {
    try {
         client.messages.create({
    body: 'Hello from HerShield! Your OTP is ' + otp,
    from: `+${twilioNumber}`, // Your Twilio number
    to: `+91${phone}` // Recipient's number
  })
  .then(message => {
    console.log(`OTP sent to ${phone}: ${otp}, SID: ${message.sid}`);
  })
  .catch(error => {
    console.error('Error sending message:', error);
  });

    } catch (error) {
      console.error('Failed to send OTP:', error);
    }
  };

module.exports = { triggerTwilioCall ,sendOtp};

