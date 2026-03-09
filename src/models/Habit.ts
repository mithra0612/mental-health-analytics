import mongoose, { Schema, Model } from "mongoose";
import type { IHabit } from "@/types";

const HabitSchema = new Schema<IHabit>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    goalId: {
      type: String,
      required: true,
    },
    completedDates: {
      type: [Date],
      default: [],
    },
    streak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Habit: Model<IHabit> =
  mongoose.models.Habit || mongoose.model<IHabit>("Habit", HabitSchema);

export default Habit;
