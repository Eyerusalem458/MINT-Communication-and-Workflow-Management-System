import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["direct", "group"], default: "direct" },
    name: { type: String, default: "" },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("Conversation", conversationSchema);
