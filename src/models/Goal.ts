import mongoose, { Schema, Model } from "mongoose";
import type { IGoal } from "@/types";

const GoalSchema = new Schema<IGoal>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["wellness", "habit", "custom"],
      default: "custom",
    },
    targetValue: {
      type: Number,
      required: true,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    unitOfMeasure: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
    startDate: {
      type: Date,
      default: () => new Date(),
    },
    targetDate: {
      type: Date,
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
    },
  },
  {
    timestamps: true,
  }
);

const Goal: Model<IGoal> =
  mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);

export default Goal;
