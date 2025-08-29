const express = require('express');
const router = express.Router();

// Feedback API Route
router.post('/', async (req, res) => {
  const { name, email, feedback, rating } = req.body;
  if (!name || !email || !feedback || !rating) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Compose the thank-you email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Thank you for your feedback at Fitworx Gym!',
    html: `
      <p>Hi <b>${name}</b>,</p>
      <p>Thank you for taking the time to share your feedback and for rating us <b>${rating}/5</b>!</p>
      <p>We truly appreciate your input. Here's what you shared with us:</p>
      <blockquote style="border-left: 4px solid #f97316; margin: 1em 0; padding: 0.5em 1em; background: #fff7ed;">
        ${feedback}
      </blockquote>
      <p>
        At <b>Fitworx Gym</b>, we are committed to providing the best possible experience for our members. Your feedback helps us improve our facilities, classes, and services. Every suggestion is reviewed by our management team and, where possible, implemented to make your gym experience even better.
      </p>
      <p>
        <b>Stay Connected:</b><br>
        - <a href="https://www.facebook.com/fitworxgymph">Facebook</a><br>
        - <a href="https://www.instagram.com/fitworxgym/">Instagram</a><br>
        - <a href="https://www.tiktok.com/@fitworxgym?lang=en">TikTok</a>
      </p>
      <p>
        <b>Special for You:</b><br>
        As a token of our appreciation, show this email at the front desk to receive a <b>free guest pass</b> for a friend or a <b>10% discount</b> on your next supplement purchase!
      </p>
      <p>
        <b>Useful Links:</b><br>
        - <a href="http://yourwebsite.com/faq">Frequently Asked Questions</a><br>
        - <a href="http://yourwebsite.com/schedule">Class Schedule</a><br>
        - <a href="mailto:fitworx@gmail.com">Contact Support</a>
      </p>
      <p>
        If you have more to share or need assistance, simply reply to this email or call us at <b>0933 874 533</b>.
      </p>
      <p>
        <i>"The difference between try and triumph is a little 'umph'!"</i>
      </p>
      <p>
        Thank you for being a valued member of the Fitworx community.<br>
        <b>Stay strong, stay motivated!</b>
      </p>
      <br>
      <p>Best regards,<br>
      <b>The Fitworx Gym Team</b></p>
      <hr>
      <p style="font-size: 0.9em; color: #888;">
        &copy; 2025 Fitworx Gym. All Rights Reserved.<br>
        This is an automated message. For urgent concerns, please contact us directly.
      </p>
    `
  };

  try { 
    await req.app.locals.transporter.sendMail(mailOptions);
    res.json({ message: 'Feedback received and email sent.' });
  } catch (error) {
    console.error('Error sending feedback email:', error);
    res.status(500).json({ error: 'Failed to send feedback email.' });
  }
});

module.exports = router;