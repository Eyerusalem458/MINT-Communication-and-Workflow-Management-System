import express from "express";
const router = express.Router();

import {
  getAllUsers,
  getStaff,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  updateMyProfile,
  changeMyPassword,
  getUserStats,
}  from "../controllers/userController.js";

import { protect, authorize }  from "../middleware/auth.js";
import upload  from "../middleware/upload.js";

router.use(protect);

router.get("/stats", authorize("admin"), getUserStats);
router.get("/staff", authorize("admin", "manager"), getStaff);
router.put("/profile/me", upload.single("avatar"), updateMyProfile);
router.put("/password/me", changeMyPassword);

router
  .route("/")
  .get(authorize("admin"), getAllUsers)
  .post(authorize("admin"), createUser);

router
  .route("/:id")
  .get(authorize("admin", "manager"), getUserById)
  .put(authorize("admin"), updateUser);

router.patch("/:id/toggle-status", authorize("admin"), toggleUserStatus);

export default router;
