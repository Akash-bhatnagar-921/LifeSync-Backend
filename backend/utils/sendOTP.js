import nodemailer from "nodemailer";
import dotenv from 'dotenv'

dotenv.config()

// ─────────────────────────────────────────────────────────────
// 1️⃣ Basic transporter (Gmail SMTP example)
//    ‣ In production, use environment variables.
//    ‣ For Gmail you must enable "Less secure app" or App Password.
// ─────────────────────────────────────────────────────────────

const transporter =
  //   process.env.NODE_ENV === "production"
  // ?
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
// : null;
console.log("ENV values:", {
  HOST: process.env.SMTP_HOST,
  USER: process.env.SMTP_USER,
  PASS: process.env.SMTP_PASS?.slice(0, 4) + "****",
  ENV: process.env.NODE_ENV,
});

transporter.verify()
  .then(() => console.log("✅ SMTP connection ready"))
  .catch((err) => console.error("❌ SMTP error:", err.message));
/* ------------------------------------------------------------------ */
/*  sendOtpToEmail(email, otp)                                         */
/* ------------------------------------------------------------------ */

export const sendOtpToEmail = async (email, otp) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`📧 [DEV] OTP for ${email}: ${otp}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"LifeSync" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your LifeSync OTP Code",
      html: `
        <h2>👋 Hey there!</h2>
        <p>Your one-time password (OTP) is:</p>
        <h1 style="letter-spacing:4px">${otp}</h1>
        <p>This code will expire in ${
          process.env.OTP_EXP_MIN || 10
        } minutes.</p>
      `,
    });

    console.log("✅ OTP e-mail sent:", info.messageId);
  } catch (err) {
    console.error("🔴 E-mail send error:", err.message);
  }
};
