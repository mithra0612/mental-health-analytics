import mongoose, { Schema, Model } from "mongoose";
import type { IEntry } from "@/types";

const EntrySchema = new Schema<IEntry>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    mood: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    stress: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    sleep: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
    },
    emotions: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: "",
    },
    triggers: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

EntrySchema.index({ userId: 1, date: -1 });

const Entry: Model<IEntry> =
  mongoose.models.Entry || mongoose.model<IEntry>("Entry", EntrySchema);

export default Entry;
