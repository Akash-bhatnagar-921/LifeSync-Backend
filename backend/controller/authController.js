import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import User from "../models/User.js";
const RESEND_GAP_SEC = 60;
const MAX_SENDS = 3;
import { sendOtpToEmail } from "../utils/sendOTP.js";

// helper -> sign JWT
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

/* ------------------------------------------------------------------ */
/*  POST /api/auth/signup                                             */
/* ------------------------------------------------------------------ */

export const registerUser = async (req, res) => {
  try {
    const { username, password, gmail, number, firstname, lastname } = req.body;

    if (!username || !gmail || !number || !password) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // check duplicates
    const exists = await User.findOne({
      $or: [{ gmail }, { username }, { number }],
    });

    if (exists) {
      return res.status(409).json({ msg: "User Already Exists" });
    }

    const hashed_password = await bcrypt.hash(password, 12);

    // generate OTP
    const otp = nanoid(6);
    const otpExpiry = Date.now() + +(process.env.OTP_EXP_MIN || 10) * 60 * 1000;

    const user = await User.create({
      username,
      gmail,
      number,
      hashed_password,
      firstname,
      lastname,
      otp,
      otpExpiry,
    });

    sendOtpToEmail(gmail, otp);

    return res.status(201).json({
      msg: "SignUp Successful. Verify OTP to email.",
      userId: user._id,
    });
  } catch (error) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ------------------------------------------------------------------ */
/*  POST /api/auth/login                                              */
/* ------------------------------------------------------------------ */

export const loginUser = async (req, res) => {
  try {
    const { gmail, username, password } = req.body;
    if ((!gmail && !username) || !password) {
      return res.status(400).json({ msg: "Missing Credentials" });
    }

    const user = await User.findOne(gmail ? { gmail } : { username });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const match = await bcrypt.compare(password, user.hashed_password);
    if (!match) return res.status(400).json({ msg: "Invalid Credentials" });

    if (!user.isVerified)
      return res.status(403).json({ msg: "User not verified" });

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id);
    const { hashed_password, otp, otpExpiry, ...safeUser } = user.toObject();

    return res.json({ token, user: safeUser });
  } catch (error) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ------------------------------------------------------------------ */
/*  POST /api/auth/verify-otp                                         */
/* ------------------------------------------------------------------ */

export const verifyOtp = async (req, res) => {
  try {
    const { gmail, otp } = req.body;
    const user = await User.findOne({ gmail });

    if (!user) return res.status(404).json({ msg: "User not found" });

    if (
      user.otp != otp ||
      !user.otpExpiry ||
      user.otpExpiry.getTime() < Date.now()
    ) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.json({ msg: "Account verified successfully" });
  } catch (error) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ------------------------------------------------------------------ */
/*  POST /api/auth/forgot-password                                    */
/* ------------------------------------------------------------------ */

export const forgotPassword = async (req, res) => {
  try {
    const { gmail } = req.body;
    const user = await User.findOne({ gmail });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const otp = nanoid(6);
    user.otp = otp;
    user.otpExpiry = Date.now() + (process.env.OTP_EXP_MIN || 10) * 60 * 1000;
    await user.save();
    sendOtpToEmail(gmail, otp);
    res.json({ msg: "OTP sent to email for password reset" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ------------------------------------------------------------------ */
/*  POST /api/auth/resend-OTP                                    */
/* ------------------------------------------------------------------ */

export const resendOtp = async (req, res) => {
  try {
    const { gmail } = req.body;
    const user = await User.findOne({ gmail });

    if (!user) return res.status(404).json({ msg: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ msg: "Already verified" });

    // Now setting the rate limiter
    const now = Date.now();
    const lastSent = user.otpLastSent?.getTime() || 0;

    if (now - lastSent < RESEND_GAP_SEC * 1000)
      return res
        .status(429)
        .json({ msg: `Wait ${RESEND_GAP_SEC}s before retry` });

    if ((user.otpResendCount || 0) >= MAX_SENDS)
      return res.status(429).json({ msg: "Max resend attempts exceeded" });

    // Generate new OTP
    const otp = nanoid(6);
    user.otp = otp;
    user.otpExpiry = new Date(
      now + +(process.env.OTP_EXP_MIN || 10) * 60 * 1000
    );
    user.otpLastSent = new Date(now);
    user.otpResendCount = (user.otpResendCount || 0) + 1;
    await user.save();

    // Send Mail
    sendOtpToEmail(gmail, otp);
    res.json({ msg: "OTP resent, valid for next " + OTP_EXP_MIN + " min" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
