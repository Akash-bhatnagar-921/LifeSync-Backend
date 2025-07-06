import mongoose from "mongoose";

const JournalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    default: "Untitled Entry",
  },
  content: {
    type: String,
    required: true,
  },
  tags: [String], // Optional: ["Work", "Life", "Goals"]
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("JournalModel",JournalEntrySchema)
