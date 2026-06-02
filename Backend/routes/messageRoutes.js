import express from "express";
const router = express.Router();

import {
  getConversations,
  getOrCreateDirectConversation,
  createGroupConversation,
  updateGroupConversation,
  getSharedMedia,
  getMessages,
  sendMessage,
  deleteMessage,
  getChatUsers,
} from "../controllers/messageController.js";

import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import Message from "../models/Message.js";

router.use(protect);

router.get("/users", getChatUsers);
router.get("/conversations", getConversations);

router.post("/conversations/direct", getOrCreateDirectConversation);
router.post("/conversations/group", createGroupConversation);
router.patch("/conversations/:conversationId", updateGroupConversation);

router.get("/:conversationId/shared-media", getSharedMedia);
router.get("/:conversationId", getMessages);
router.post("/:conversationId", upload.single("file"), sendMessage);

router.delete("/message/:messageId", deleteMessage);

// ── Edit message ──────────────────────────────────────────────────────────────
router.put("/message/:messageId", async (req, res) => {
  try {
    const msg = await Message.findById(req.params.messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });
    if (msg.sender.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
 
    msg.text = req.body.text;
    msg.isEdited = true;
    await msg.save();
 
    // Broadcast to everyone in the conversation room
    const io = req.app.get("io");
    if (io) {
      io.to(msg.conversationId.toString()).emit("messageEdited", {
        messageId: msg._id,
        newText: msg.text,
        conversationId: msg.conversationId,
      });
    }
 
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
