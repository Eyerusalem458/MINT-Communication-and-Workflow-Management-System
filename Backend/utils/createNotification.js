import Notification from "../models/Notification.js";

const createNotification = async ({ recipient, sender, type, message }, io) => {
  const recipients = Array.isArray(recipient) ? recipient : [recipient];

  const notifications = await Notification.insertMany(
    recipients.map((r) => ({
      recipient: r,
      sender: sender || null,
      type,
      message,
    })),
  );

  // Real-time push (Socket.IO)
  if (io) {
    notifications.forEach((notif) => {
      io.to(`user_${notif.recipient}`).emit("notification", notif);
    });
  }

  return notifications;
};

export default createNotification;
