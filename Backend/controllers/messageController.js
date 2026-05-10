import Message  from "../models/Message.js";
import Conversation  from "../models/Conversation.js";
import User  from "../models/User.js";
import logActivity  from "../utils/logActivity.js";


const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "firstName lastName avatar role")
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

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      type: "direct",
      participants: { $all: [req.user._id, userId], $size: 2 },
    }).populate("participants", "firstName lastName avatar role");

    if (!conversation) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [req.user._id, userId],
        createdBy: req.user._id,
      });
      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        "firstName lastName avatar role",
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
      "firstName lastName avatar role",
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Make sure user is a participant
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

    // Mark messages as read
    await Message.updateMany(
      { conversationId, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } },
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    if (!isParticipant) {
      return res.status(403).json({ message: "Not a participant" });
    }

    // Determine file type from upload
    let fileField = {};
    if (req.file) {
      const { mimetype, filename, originalname, size } = req.file;

      if (mimetype.startsWith("image/") || mimetype.startsWith("video/")) {
        fileField = {
          media: `/uploads/media/${filename}`,
          fileType: mimetype,
          fileName: originalname,
        };
      } else if (mimetype.startsWith("audio/")) {
        fileField = {
          audio: `/uploads/audio/${filename}`,
          fileType: mimetype,
          fileName: originalname,
        };
      } else {
        fileField = {
          file: `/uploads/files/${filename}`,
          fileType: mimetype,
          fileName: originalname,
          fileSize: `${(size / 1024).toFixed(1)} KB`,
        };
      }
    }

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      text: text || "",
      replyTo: replyTo || null,
      readBy: [req.user._id],
      ...fileField,
    });

    // Update conversation lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text || (req.file ? `📎 ${req.file.originalname}` : ""),
      lastMessageAt: new Date(),
    });

    const populated = await Message.findById(message._id)
      .populate("sender", "firstName lastName avatar role")
      .populate("replyTo");

    // Emit via Socket.IO
    if (req.io) {
      req.io.to(`conversation_${conversationId}`).emit("newMessage", populated);
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
      // ✅ staff can only message managers in same department
      filter.role = "manager";
      filter.department = department;
    } else if (role === "manager") {
      // ✅ manager can message staff in same dept + admin only
      filter.$or = [
        { role: "staff", department: department },
        { role: "admin" },
        { role: "manager", department: department }, // same dept managers
      ];
    } else if (role === "admin") {
      // ✅ admin can message everyone
      // no extra filter
    }

    const users = await User.find(filter).select(
      "firstName lastName role department avatar",
    );

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export  {
  getConversations,
  getOrCreateDirectConversation,
  createGroupConversation,
  getMessages,
  sendMessage,
  deleteMessage,
  getChatUsers,
};
