import express from 'express'

import {
  registerUser,
  loginUser,
  verifyOtp,
  forgotPassword,
  resendOtp
} from "../controller/authController.js";


const router = express.Router()

router.post("/signUp", registerUser)

router.post("/login", loginUser)

router.post("/verify-otp", verifyOtp)

router.post("/forget-password", forgotPassword)

router.post("/resend-otp", resendOtp)


export default router;