import mongoose from "mongoose";

const moodLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mood: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
  score:{
    type:Number
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("MoodLog", moodLogSchema);