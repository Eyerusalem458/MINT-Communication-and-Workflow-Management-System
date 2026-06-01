import express from "express";
const router = express.Router();

import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} from "../controllers/taskController.js";

import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

router.use(protect);

router.get("/stats", getTaskStats);

router.route("/").get(getTasks).post(authorize("manager", "admin"), createTask);

router
  .route("/:id")
  .get(getTaskById)
  .put(upload.single("file"), updateTask)
  .delete(authorize("manager", "admin"), deleteTask);

export default router;
