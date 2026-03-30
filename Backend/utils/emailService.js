const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,           // your Gmail address
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: `Team HerShield <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    html: `
      <h2>Your OTP Code</h2>
      <p>Use the code below to verify your email. It expires in <b>5 minutes</b>.</p>
      <h1 style="letter-spacing: 4px;">${otp}</h1>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };