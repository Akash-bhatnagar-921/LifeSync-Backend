import express from "express";

import {
  createJournal,
  tilesData,
  getAllJournal,
  editJournal,
  deleteJournal,
  getWeeklyStats,
} from "../controller/journalController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", createJournal);
router.get("/getTilesData", tilesData);
router.get("/getJournal", getAllJournal);
router.put("/editJournal/:id", editJournal);
router.delete("/deleteJournal/:id", deleteJournal);
router.get("/weekly-stats", getWeeklyStats);

export default router;
