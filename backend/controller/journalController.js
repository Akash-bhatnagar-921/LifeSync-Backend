import Journal from "../models/Journal.js";
import mongoose from "mongoose";


// 1. Create journal entry
export const createJournal = async () => {
  try {
    const { title, content, tags, mood } = req.body;
    const newEntry = await Journal.create({
      userId: req.user.id,
      title,
      content,
      tags,
      mood,
    });
    res.status(201).json({ msg: "Journal created", data: newEntry });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// 2. Last entry + streak + trending
export const tilesData = async () => {
  try {
    const entries = await Journal.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    const lastEntry = entries[0];

    // Calculate streak
    let streak = 0;
    let maxStreak = 0;
    let prev = new Date();
    prev.setHours(0, 0, 0, 0);
    for (let entry of entries) {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      if (prev.getTime() - entryDate.getTime() <= 86400000) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
        prev = entryDate;
      } else {
        break;
      }
    }

    // Trending tags
    const tagFreq = {};
    entries.forEach((e) =>
      e.tags?.forEach((tag) => (tagFreq[tag] = (tagFreq[tag] || 0) + 1))
    );
    const trendingTags = Object.entries(tagFreq)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);

    res.json({
      lastEntry,
      streak: { currentStreak: streak, maxStreak },
      trendingTags,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// 3. Get all entries with search
export const getAllJournal = async () => {
  try {
    const search = req.query.search || "";
    const entries = await Journal.find({
      userId: req.user.id,
      $or: [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// 4. Edit entry
export const editJournal = async () => {
  try {
    const { title, content, tags, mood } = req.body;
    const updated = await Journal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, content, tags, mood },
      { new: true }
    );
    res.json({ msg: "Updated", data: updated });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// 5. Delete entry
export const deleteJournal = async () => {
  try {
    await Journal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// 6. Weekly stats
export const getWeeklyStats = async () => {
  try {
    const stats = await Journal.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          createdAt: { $gte: new Date(Date.now() - 7 * 86400000) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%d-%m", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export default router;
