import mongoose, { Schema, Model } from "mongoose";
import type { IAnalytics } from "@/types";

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    period: {
      type: String,
      required: true,
    },
    weeklyMoodAvg: {
      type: Number,
      default: 0,
    },
    sleepAvg: {
      type: Number,
      default: 0,
    },
    stressTrend: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    insights: {
      type: [String],
      default: [],
    },
    computedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

AnalyticsSchema.index({ userId: 1, period: 1 });

const Analytics: Model<IAnalytics> =
  mongoose.models.Analytics ||
  mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);

export default Analytics;
