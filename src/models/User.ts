import mongoose, { Schema, Model } from "mongoose";
import type { IUser } from "@/types";

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    profile: {
      name: { type: String, required: true },
      avatar: { type: String, default: "" },
    },
    preferences: {
      purposes: { type: [String], default: [] },
      stressBaseline: { type: Number, default: 5 },
      sleepHours: { type: Number, default: 8 },
      goals: { type: [String], default: [] },
      notifications: { type: Boolean, default: true },
    },
    dashboardConfig: {
      showMoodChart: { type: Boolean, default: true },
      showSleepChart: { type: Boolean, default: true },
      showStressChart: { type: Boolean, default: true },
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
