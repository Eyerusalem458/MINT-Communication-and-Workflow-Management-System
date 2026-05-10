import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: ["Task", "Project", "System", "Personal", "Deadline"],
      default: "System",
    },
    message: { type: String, required: true },
    unseen: { type: Boolean, default: true },
    link: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("Notification", notificationSchema);
