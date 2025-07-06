import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    number: {
      type: String,
      required: true,
      unique: true,
      length: 10,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    firstName: String,
    lastName: String,
    age: Number,
    relationshipStatus: {
      type: String,
      enum: ["single", "committed", "married", "complicated", "unknown"],
      default: "unknown",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: "prefer_not_to_say",
    },
    // profilePic: {
    //   type: String, // Store file path or public URL
    //   default: "",
    // },
    lastLogin: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    otpLastSent: Date,
    otpResendCount: { type: Number, default: 0 },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const User = mongoose.model("User", userSchema);
export default User;
