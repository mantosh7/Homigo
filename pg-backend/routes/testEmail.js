const express = require("express");
const transporter = require("../utils/email");
const generateOTP = require("../utils/otp");
const { saveAdminOtp, verifyAdminOtp, deleteAdminOTP } = require("../utils/adminOtp");
const AppError = require('../middleware/AppError');

const router = express.Router();

router.post("/send", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const otp = generateOTP();

    await saveAdminOtp(email, otp);

    await transporter.sendMail({
      from: `"Homigo" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Homigo OTP Test",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });

    res.json({ message: "OTP email sent" });
  } catch (err) {
    next(err)
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new AppError('Email and OTP required', 400);
    }

    const [row] = await verifyAdminOtp(email, otp);
    if (row.length === 0) {
      throw new AppError('Invalid OTP', 400);
    }

    const record = row[0];

    if (new Date(record.expires_at) < new Date()) {
      throw new AppError('OTP has expired', 400);
    }

    await deleteAdminOTP(email);
    res.json({ message: "OTP verified successfully" });

  } catch (err) {
    next(err)
  }
})

module.exports = router;
