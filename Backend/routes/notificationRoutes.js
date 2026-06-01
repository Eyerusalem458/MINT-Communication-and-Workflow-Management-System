import express from "express";
const router = express.Router();

import {
  getNotifications,
  markAllAsRead,
  markAsRead,
  getUnseenCount,
}  from"../controllers/notificationController.js";

import { protect }  from "../middleware/auth.js";

router.use(protect);

router.get("/", getNotifications);
router.get("/unseen-count", getUnseenCount);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;
