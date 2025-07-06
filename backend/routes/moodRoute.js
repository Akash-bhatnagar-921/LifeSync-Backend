import express from "express";
import { protect } from "../middleware/auth.js";
import { logMood,getMoodLogs,getMoodStatus, getWeeklyMoodStats} from "../controller/moodController.js";

const router = express.Router()

router.post("/log",protect,logMood)
router.post("/history",protect,getMoodLogs)
router.post("/stats",protect,getMoodStatus)
router.get("/weekly-stats", protect, getWeeklyMoodStats);

export default router;