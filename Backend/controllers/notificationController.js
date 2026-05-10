import Notification  from "../models/Notification.js";
import mongoose from "mongoose";

const getNotifications = async (req, res) => {
  try {
    const { type, unseen } = req.query;
    const filter = { recipient: req.user._id };

    if (type && type !== "All" && type !== "Unseen") {
      filter.type = type;
    }

    if (type === "Unseen" || unseen === "true") {
      filter.unseen = true;
    }

    const notifications = await Notification.find(filter)
      .populate("sender", "firstName lastName avatar")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, unseen: true },
      { unseen: false },
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
       return res.status(400).json({ message: "Invalid ID" });
     }
     
    const notif = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notif)
      return res.status(404).json({ message: "Notification not found" });

    notif.unseen = false;
    await notif.save();
    
    res.json(notif);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getUnseenCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      unseen: true,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export  {
  getNotifications,
  markAllAsRead,
  markAsRead,
  getUnseenCount,
};