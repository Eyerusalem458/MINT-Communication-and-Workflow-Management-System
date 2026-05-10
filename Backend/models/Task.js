import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: { type: String, default: "" },
    due: { type: String, required: true },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Completed",
        "Approved",
        "Rejected",
        "Cancelled",
      ],
      default: "Pending",
    },
    comment: { type: String, default: "" },
    file: { type: String, default: "" },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("Task", taskSchema);
