const express = require("express");
const transporter = require("../utils/email");
const generateOTP = require("../utils/otp");
const {saveAdminOtp, verifyAdminOtp, deleteAdminOTP} = require("../utils/adminOtp");

const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otp = generateOTP();
    console.log("Generated OTP:", otp);

    await saveAdminOtp(email, otp);

    await transporter.sendMail({
      from: `"Homigo" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Homigo OTP Test",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });

    res.json({ message: "OTP email sent" });
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    res.status(500).json({ message: "Email failed" });
  }
});

router.post('/verify', async (req, res)=>{
  try {
    const {email, otp} = req.body ;

    if(!email || !otp) return res.status(400).json({message: "Email and OTP required"}) ;

    const [row] = await verifyAdminOtp(email, otp) ;
    if(row.length == 0) return res.status(400).json({message: "Invalid OTP"}) ;

    const record = row[0] ;
    
    if(new Date(record.expires_at) < new Date()) return res.status(400).json({message: "Invalid expired"}) ;

    await deleteAdminOTP(email) ;
    res.json({message: "OTP verified successfully"}) ;
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
})

module.exports = router;
