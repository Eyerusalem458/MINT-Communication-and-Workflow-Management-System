import express from "express";
const router = express.Router();

import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  cancelProject,
  approveProject,
  rejectProject,
  getProjectStats,
} from "../controllers/projectController.js";

import { protect, authorize }  from "../middleware/auth.js";
import upload  from "../middleware/upload.js";

router.use(protect);

router.get("/stats", getProjectStats);

router
  .route("/")
  .get(getProjects)
  .post(authorize("staff"), upload.single("file"), createProject);

router
  .route("/:id")
  .get(getProjectById)
  .put(authorize("staff"), upload.single("file"), updateProject);

router.patch("/:id/cancel", authorize("staff"), cancelProject);
router.patch("/:id/approve", authorize("manager", "admin"), approveProject);
router.patch("/:id/reject", authorize("manager", "admin"), rejectProject);

export default router;
