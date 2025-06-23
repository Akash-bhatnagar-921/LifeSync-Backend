import { protect } from "../middleware/auth.js";
import { getMe } from "../controller/userController.js";
import express from "express";

const router = express.Router()

router.get('/me',protect,getMe)

export default router;