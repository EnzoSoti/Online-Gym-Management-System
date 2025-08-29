const nodemailer = require("nodemailer");

const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Note: rejectUnauthorized set to false for development only
    // This should be true in production for security
    rejectUnauthorized: false,
  },
};

const transporter = nodemailer.createTransport(emailConfig);

module.exports = transporter;