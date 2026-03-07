import Entry from "@/models/Entry";
import Analytics from "@/models/Analytics";
import { calculateStreak } from "./utils";
import type { IEntry, IAnalytics } from "@/types";

export async function computeAnalytics(userId: string): Promise<IAnalytics> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const entries = await Entry.find({
    userId,
    date: { $gte: weekAgo },
  }).sort({ date: -1 });

  const allEntries = await Entry.find({ userId }).sort({ date: -1 });

  let weeklyMoodAvg = 0;
  let sleepAvg = 0;
  let stressTrend = 0;

  if (entries.length > 0) {
    const totalMood = entries.reduce((sum, entry) => sum + entry.mood, 0);
    weeklyMoodAvg = Math.round((totalMood / entries.length) * 10) / 10;

    const totalSleep = entries.reduce((sum, entry) => sum + entry.sleep, 0);
    sleepAvg = Math.round((totalSleep / entries.length) * 10) / 10;

    const stressValues = entries.map((e) => e.stress);
    if (stressValues.length >= 2) {
      const firstHalf = stressValues.slice(0, Math.floor(stressValues.length / 2));
      const secondHalf = stressValues.slice(Math.floor(stressValues.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      stressTrend = Math.round((secondAvg - firstAvg) * 10) / 10;
    }
  }

  const streak = calculateStreak(allEntries);
  const insights = generateInsights(entries, weeklyMoodAvg, sleepAvg, stressTrend, streak);

  const period = `week-${now.toISOString().split("T")[0]}`;

  const analyticsData: Partial<IAnalytics> = {
    userId,
    period,
    weeklyMoodAvg,
    sleepAvg,
    stressTrend,
    streak,
    insights,
    computedAt: now,
  };

  await Analytics.findOneAndUpdate(
    { userId, period },
    analyticsData,
    { upsert: true, new: true }
  );

  return analyticsData as IAnalytics;
}

function generateInsights(
  entries: IEntry[],
  moodAvg: number,
  sleepAvg: number,
  stressTrend: number,
  streak: number
): string[] {
  const insights: string[] = [];

  if (entries.length === 0) {
    insights.push("Start logging your daily entries to see personalized insights.");
    return insights;
  }

  if (moodAvg >= 4) {
    insights.push("Great job! Your mood has been positive this week.");
  } else if (moodAvg <= 2) {
    insights.push("Your mood has been lower than usual. Consider reaching out to someone you trust.");
  }

  if (sleepAvg < 6) {
    insights.push("You're getting less than 6 hours of sleep. Try to prioritize rest.");
  } else if (sleepAvg >= 7 && sleepAvg <= 9) {
    insights.push("Your sleep duration is in the healthy range. Keep it up!");
  }

  if (stressTrend > 1) {
    insights.push("Your stress levels are increasing. Consider taking breaks and practicing relaxation.");
  } else if (stressTrend < -1) {
    insights.push("Your stress levels are decreasing. Whatever you're doing is working!");
  }

  if (streak >= 7) {
    insights.push(`Amazing! You've logged ${streak} days in a row. Consistency is key!`);
  } else if (streak >= 3) {
    insights.push(`Good work! ${streak} day logging streak. Keep building the habit!`);
  }

  const emotions = entries.flatMap((e) => e.emotions);
  const emotionCounts: Record<string, number> = {};
  emotions.forEach((e) => {
    emotionCounts[e] = (emotionCounts[e] || 0) + 1;
  });
  const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
  if (topEmotion) {
    insights.push(`Your most frequent emotion this week: ${topEmotion[0]}`);
  }

  return insights;
}

export async function getWeeklyChartData(userId: string) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const entries = await Entry.find({
    userId,
    date: { $gte: weekAgo },
  }).sort({ date: 1 });

  return entries.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("en-US", { weekday: "short" }),
    mood: entry.mood,
    sleep: entry.sleep,
    stress: entry.stress,
  }));
}

export async function getTodayEntry(userId: string): Promise<IEntry | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const entry = await Entry.findOne({
    userId,
    date: { $gte: today, $lt: tomorrow },
  });

  return entry;
}
