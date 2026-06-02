import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import logActivity from "../utils/logActivity.js";
import createNotification from "../utils/createNotification.js";

// ── shared select string so it's consistent everywhere ──────────────────────
const PARTICIPANT_FIELDS =
  "firstName lastName avatar role email phone department gender status";

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", PARTICIPANT_FIELDS)
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOrCreateDirectConversation = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const otherUser = await User.findById(userId);
    if (!otherUser) return res.status(404).json({ message: "User not found" });

    let conversation = await Conversation.findOne({
      type: "direct",
      participants: { $all: [req.user._id, userId], $size: 2 },
    }).populate("participants", PARTICIPANT_FIELDS);

    if (!conversation) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [req.user._id, userId],
        createdBy: req.user._id,
      });
      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        PARTICIPANT_FIELDS,
      );
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createGroupConversation = async (req, res) => {
  try {
    const { name, participants } = req.body;

    if (!name || !participants || participants.length < 2) {
      return res
        .status(400)
        .json({ message: "Name and at least 2 participants required" });
    }

    const allParticipants = [
      ...new Set([req.user._id.toString(), ...participants]),
    ];

    const conversation = await Conversation.create({
      type: "group",
      name,
      participants: allParticipants,
      createdBy: req.user._id,
    });

    const populated = await Conversation.findById(conversation._id).populate(
      "participants",
      PARTICIPANT_FIELDS,
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateGroupConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { name, addParticipants } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    if (conversation.type !== "group")
      return res.status(400).json({ message: "Not a group conversation" });

    const isCreator =
      conversation.createdBy?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isCreator && !isAdmin)
      return res.status(403).json({ message: "Not allowed" });

    if (name) conversation.name = name;
    if (addParticipants?.length) {
      const existing = conversation.participants.map((p) => p.toString());
      const newOnes = addParticipants.filter((id) => !existing.includes(id));
      conversation.participants.push(...newOnes);
    }

    await conversation.save();

    const updated = await Conversation.findById(conversationId).populate(
      "participants",
      PARTICIPANT_FIELDS,
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    const isParticipant = conversation.participants
      .map((p) => p.toString())
      .includes(req.user._id.toString());

    if (!isParticipant) {
      return res
        .status(403)
        .json({ message: "Not a participant of this conversation" });
    }

    const messages = await Message.find({
      conversationId,
      isDeleted: false,
    })
      .populate("sender", "firstName lastName avatar role")
      .populate("replyTo")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { conversationId, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } },
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSharedMedia = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    const isParticipant = conversation.participants
      .map((p) => p.toString())
      .includes(req.user._id.toString());
    if (!isParticipant)
      return res.status(403).json({ message: "Not a participant" });

    const sharedMessages = await Message.find({
      conversationId,
      isDeleted: false,
      $or: [
        { media: { $ne: "" } },
        { file: { $ne: "" } },
        { audio: { $ne: "" } },
      ],
    })
      .select("media file audio fileType fileName fileSize createdAt sender")
      .populate("sender", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(sharedMessages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Helper: build a human-readable notification snippet ──────────────────────
const getNotificationSnippet = (text, file) => {
  if (!file) return (text || "").slice(0, 50);

  const { mimetype } = file;
  if (mimetype.startsWith("audio/")) return "🎵 Audio";
  if (mimetype.startsWith("image/")) return "🖼 Photo";
  if (mimetype.startsWith("video/")) return "🎬 Video";
  if (mimetype === "application/pdf") return "📄 PDF";
  if (mimetype.includes("word")) return "📝 Document";
  if (mimetype.includes("spreadsheet") || mimetype.includes("excel"))
    return "📊 Spreadsheet";
  if (mimetype.includes("presentation") || mimetype.includes("powerpoint"))
    return "📋 Presentation";
  return "📎 File";
};

// ── Helper: build a human-readable lastMessage for the conversation ───────────
const getLastMessageLabel = (text, file) => {
  if (!file) return text || "";

  const { mimetype, originalname } = file;
  if (mimetype.startsWith("audio/")) return "🎵 Audio";
  if (mimetype.startsWith("image/")) return "🖼 Photo";
  if (mimetype.startsWith("video/")) return "🎬 Video";
  return `📎 ${originalname}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// DROP-IN REPLACEMENT for the sendMessage function in your messageController.js
// Replace the entire sendMessage export with this.
// Everything else in the file stays the same.
// ─────────────────────────────────────────────────────────────────────────────

const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, replyTo } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    const isParticipant = conversation.participants
      .map((p) => p.toString())
      .includes(req.user._id.toString());

    if (!isParticipant)
      return res.status(403).json({ message: "Not a participant" });

    // ── Build file fields ──────────────────────────────────────────────────
    let fileField = {};

    if (req.file) {
      const { filename, originalname, size } = req.file;

      // FIX: strip codec params before checking MIME type
      // e.g. "audio/webm;codecs=opus" → "audio/webm"
      const mimeBase = req.file.mimetype.split(";")[0].trim().toLowerCase();
      const mimeType = mimeBase.split("/")[0]; // "audio" | "image" | "video"

      if (mimeType === "image" || mimeType === "video") {
        fileField = {
          media: `/uploads/media/${filename}`,
          fileType: mimeBase,
          fileName: originalname,
          fileSize: `${(size / 1024).toFixed(1)} KB`,
        };
      } else if (mimeType === "audio") {
        fileField = {
          audio: `/uploads/audio/${filename}`,
          fileType: mimeBase,
          fileName: originalname,
          fileSize: `${(size / 1024).toFixed(1)} KB`,
        };
      } else {
        fileField = {
          file: `/uploads/files/${filename}`,
          fileType: mimeBase,
          fileName: originalname,
          fileSize: `${(size / 1024).toFixed(1)} KB`,
        };
      }
    }

    // ── Create message ─────────────────────────────────────────────────────
    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      text: text || "",
      replyTo: replyTo || null,
      readBy: [req.user._id],
      ...fileField,
    });

    // ── Update conversation preview ────────────────────────────────────────
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: getLastMessageLabel(text, req.file),
      lastMessageAt: new Date(),
    });

    // ── Populate & emit ────────────────────────────────────────────────────
    const populated = await Message.findById(message._id)
      .populate("sender", "firstName lastName avatar role")
      .populate("replyTo");

    if (req.io) {
      req.io.to(`conversation_${conversationId}`).emit("newMessage", populated);
    }

    // ── Notifications ──────────────────────────────────────────────────────
    const otherParticipants = conversation.participants.filter(
      (p) => p.toString() !== req.user._id.toString(),
    );

    if (otherParticipants.length > 0) {
      const snippet = getNotificationSnippet(text, req.file);
      await createNotification(
        {
          recipient: otherParticipants,
          sender: req.user._id,
          type: "Personal",
          message: `New message from ${req.user.firstName} ${req.user.lastName}: "${snippet}"`,
        },
        req.io,
      );
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Can only delete your own messages" });
    }

    message.isDeleted = true;
    message.text = "This message was deleted";
    await message.save();

    if (req.io) {
      req.io
        .to(`conversation_${message.conversationId}`)
        .emit("messageDeleted", {
          messageId: message._id,
          conversationId: message.conversationId,
        });
    }

    res.json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChatUsers = async (req, res) => {
  try {
    const { role, _id, department } = req.user;

    let filter = {
      _id: { $ne: _id },
      status: "Active",
    };

    if (role === "staff") {
      filter.role = "manager";
      filter.department = department;
    } else if (role === "manager") {
      filter.$or = [
        { role: "staff", department: department },
        { role: "admin" },
        { role: "manager", department: department },
      ];
    }

    const users = await User.find(filter).select(
      "firstName lastName role department avatar",
    );

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getConversations,
  getOrCreateDirectConversation,
  createGroupConversation,
  updateGroupConversation,
  getSharedMedia,
  getMessages,
  sendMessage,
  deleteMessage,
  getChatUsers,
};
