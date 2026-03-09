import mongoose, { Schema, Model } from "mongoose";
import type { IChatSession } from "@/types";

const ChatMessageSchema = new Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: () => new Date() },
});

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [ChatMessageSchema],
    summary: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const ChatSession: Model<IChatSession> =
  mongoose.models.ChatSession ||
  mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);

export default ChatSession;
