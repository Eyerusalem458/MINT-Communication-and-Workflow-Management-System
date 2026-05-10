import express from "express";
const router = express.Router();

import {
  getConversations,
  getOrCreateDirectConversation,
  createGroupConversation,
  getMessages,
  sendMessage,
  deleteMessage,
  getChatUsers,
}  from "../controllers/messageController.js";

import { protect }  from "../middleware/auth.js";
import upload  from "../middleware/upload.js";

router.use(protect);

router.get("/users", getChatUsers);
router.get("/conversations", getConversations);

router.post("/conversations/direct", getOrCreateDirectConversation);
router.post("/conversations/group", createGroupConversation);

router.get("/:conversationId", getMessages);
router.post("/:conversationId", upload.single("file"), sendMessage);

router.delete("/message/:messageId", deleteMessage);

export default router;
