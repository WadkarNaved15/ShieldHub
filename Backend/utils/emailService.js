const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (email, otp) => {
  await resend.emails.send({
     from: 'HerShield <otp@hershield.nexie.in>', 
    to: email,
    subject: 'Your OTP Code',
    html: `
      <h2>Your OTP Code</h2>
      <p>Use the code below to verify your email. It expires in <b>5 minutes</b>.</p>
      <h1 style="letter-spacing: 4px;">${otp}</h1>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
};

module.exports = { sendOtpEmail };