import MoodLog from "../models/Model.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import moment from "moment";

export const logMood = async (req, res) => {
  let { mood, note } = req.body;
  // console.log(req)
  const userId = req.user.id;
  console.log(mood, note);
  console.log(userId);
  try {
    if (!mood) return res.status(401).send({ msg: "Missing Moods" });
    console.log("came hrex");
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    let score = 0;
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    console.log(mood);
    // Check if already logged today
    switch (mood) {
      case "Amazing": {
        score = 5;
        mood = "🥰";
        break;
      }
      case "Happy": {
        console.log("i am happy");
        score = 4;
        mood = "🙂";
        break;
      }

      case "Good": {
        score = 3;
        mood = "😐";
        console.log("my mmood is ", mood);
        break;
      }

      case "Neutral": {
        score = 2;
        mood = "😶";
        break;
      }

      case "Sad": {
        console.log("i am");
        score = 1;
        mood = "😔";
        break;
      }

      default:
        break;
    }
    console.log("out of switch box");
    const alreadyLogged = await MoodLog.findOne({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (alreadyLogged) {
      console.log(userId, mood, note, score);
      await MoodLog.updateOne(
        {
          userId: userId,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
        {
          mood,
          note,
          score,
          createdAt: Date.now(), // optional
        }
      );
      return res.status(200).json({ msg: "Mood Updated Successfully" });
    }
    console.log(userId, mood, note, score);
    const newLog = await MoodLog.create({ userId, mood, note, score });
    console.log("newLog", newLog);
    res.status(201).send({
      msg: "Mood Logged Successfully",
      data: newLog,
    });
  } catch (error) {
    res.status(500).send({ msg: "Server Error", error: error.message });
  }
};

export const getMoodLogs = async (req, res) => {
  try {
    const logs = await MoodLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);
    console.log(logs);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch mood logs" });
  }
};

export const getMoodStatus = async (req, res) => {
  try {
    const stats = await MoodLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $sort: {
          createdAt: 1, // Latest first
        },
      },
      {
        $limit: 7,
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: { format: "%d-%m", date: "$createdAt" },
          },
          averageScore: "$score", // 👈 bas yahi naam rakho for frontend consistency
        },
      },
    ]);

    console.log("stats of stats", stats);
    res.json(stats);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Failed to fetch stats", error: error.message });
  }
};

export const getWeeklyMoodStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Last 7 days' mood logs (grouped by day)
    const stats = await MoodLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          averageScore: { $avg: "$score" },
          totalScore: { $sum: "$score" },
        },
      },
      { $sort: { totalScore: -1, _id: -1 } },
    ]);

    const lastWeekAvg = await MoodLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: {
            $gte: moment().subtract(14, "days").toDate(),
            $lt: moment().subtract(7, "days").toDate(),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          average: { $avg: "$score" },
        },
      },
    ]);
    console.log("lastWeekAvg", lastWeekAvg);
    console.log("stats", stats);

    // 2. Calculate overall average score
    let total = 0;
    let count = 0;
    let bestDay = null;

    for (const day of stats) {
      total += day.averageScore;
      count++;
    }

    const averageScore = count ? parseFloat((total / count).toFixed(2)) : 0;

    if (stats.length > 0) {
      const bestDate = new Date(stats[0]._id);
      bestDay = bestDate.toLocaleDateString("en-US", { weekday: "long" });
    } else {
      bestDay = "No Good days in past 7 Days";
    }

    // 3. Mood Streak Calculation
    const allLogs = await MoodLog.find({ userId }).sort({ createdAt: -1 });

    let currentStreak = 0;
    let maxStreak = 0;
    let prevDate = null;

    for (const log of allLogs) {
      const logDate = new Date(log.createdAt);
      const currentDate = new Date(
        logDate.getFullYear(),
        logDate.getMonth(),
        logDate.getDate()
      ).getTime();

      if (prevDate === null) {
        currentStreak = 1;
      } else {
        const diff = prevDate - currentDate;
        if (diff === 86400000) {
          currentStreak++;
        } else if (diff === 0) {
          continue; // same day log, ignore
        } else {
          break;
        }
      }

      prevDate = currentDate;
    }

    maxStreak = currentStreak; // or fetch max from DB later if storing
    console.log({
      averageMood: averageScore,
      bestDay,
      streak: {
        currentStreak,
        maxStreak,
      },
      lastWeekAvg,
    });
    return res.json({
      averageMood: averageScore,
      bestDay,
      streak: {
        currentStreak,
        maxStreak,
      },
      lastWeekAvg,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Something went wrong." });
  }
};
