import express from "express";
const router = express.Router();

import { getActivityLogs }  from "../controllers/activityController.js";
import { protect }  from"../middleware/auth.js";

router.use(protect);

router.get("/", getActivityLogs);

export default router;
