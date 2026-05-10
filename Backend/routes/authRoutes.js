import express  from "express";
const router = express.Router();

import {
  login,
  forgotPassword,
  resetPassword,
  getMe,
}  from "../controllers/authController.js";

import { protect } from "../middleware/auth.js";

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);

export default router;
