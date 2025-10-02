import express from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";

const router = express.Router();

// Temporary in-memory store { email -> { otp, expires } }
const otpStore = new Map();

// configure nodemailer transport (use env variables)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// helper to send email
async function sendOtpMail(to, otp) {
  const mailOptions = {
    from: `StackOverflow Clone <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your verification OTP",
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  };
  await transporter.sendMail(mailOptions);
}

// POST /user/send-email-otp
router.post("/send-email-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  // generate 6 digit otp
  const otp = crypto.randomInt(100000, 999999).toString();
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(email, { otp, expires });

  try {
    await sendOtpMail(email, otp);
    res.json({ message: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// POST /user/verify-email-otp
router.post("/verify-email-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

  const record = otpStore.get(email);
  if (!record) return res.status(400).json({ message: "No OTP sent" });
  if (record.expires < Date.now()) {
    otpStore.delete(email);
    return res.status(400).json({ message: "OTP expired" });
  }
  if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

  otpStore.delete(email);
  res.json({ message: "OTP verified" });
});

export default router;
