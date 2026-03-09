import { IEntry } from "@/types";

export interface InsightResult {
  type: "trend" | "pattern" | "correlation" | "recommendation";
  title: string;
  description: string;
  relevance: "high" | "medium" | "low";
}

export function generateWeeklyInsights(entries: IEntry[]): InsightResult[] {
  const insights: InsightResult[] = [];

  if (entries.length === 0) return insights;

  const moods = entries.map((e) => e.mood);
  const sleeps = entries.map((e) => e.sleep);
  const stresses = entries.map((e) => e.stress);

  // Mood trend
  const moodTrend = calculateTrend(moods);

  if (moodTrend > 0.15) {
    insights.push({
      type: "trend",
      title: "Mood Improving",
      description: `Your mood improved ${Math.round(moodTrend * 100)}% this week`,
      relevance: "high",
    });
  } else if (moodTrend < -0.15) {
    insights.push({
      type: "trend",
      title: "Mood Declining",
      description: `Your mood declined ${Math.round(Math.abs(moodTrend) * 100)}% this week`,
      relevance: "high",
    });
  }

  // Sleep quality
  const sleepAvg = sleeps.reduce((sum, e) => sum + e, 0) / sleeps.length;
  if (sleepAvg >= 7.5 && sleepAvg <= 8.5) {
    insights.push({
      type: "recommendation",
      title: "Great Sleep Pattern",
      description: `You're consistently getting ${sleepAvg.toFixed(1)} hours of sleep`,
      relevance: "medium",
    });
  } else if (sleepAvg < 6) {
    insights.push({
      type: "recommendation",
      title: "Increase Sleep",
      description: `Consider aiming for 7-9 hours. Currently at ${sleepAvg.toFixed(1)} hours`,
      relevance: "high",
    });
  }

  // Emotion frequency
  const emotionCounts = analyzeEmotions(entries);
  const topEmotion = emotionCounts[0];
  if (topEmotion) {
    insights.push({
      type: "pattern",
      title: `Most Common: ${topEmotion.emotion}`,
      description: `You felt ${topEmotion.emotion.toLowerCase()} ${topEmotion.count} times this week`,
      relevance: "medium",
    });
  }

  // Trigger analysis
  const triggers = analyzeTriggers(entries);
  if (triggers.length > 0) {
    insights.push({
      type: "pattern",
      title: "Top Triggers Identified",
      description: `"${triggers[0].trigger}" affected you the most`,
      relevance: "medium",
    });
  }

  // Stress trend
  const stressTrend = calculateTrend(stresses);
  if (stressTrend < -0.15) {
    insights.push({
      type: "trend",
      title: "Stress Decreasing",
      description: `Great job! Your stress is trending downward`,
      relevance: "high",
    });
  }

  return insights;
}

function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const avg1 = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
  const avg2 = secondHalf.reduce((a, b) => a + b) / secondHalf.length;
  return (avg2 - avg1) / avg1;
}

function analyzeEmotions(
  entries: IEntry[]
): Array<{ emotion: string; count: number }> {
  const counts: Record<string, number> = {};

  entries.forEach((entry) => {
    entry.emotions.forEach((emotion) => {
      counts[emotion] = (counts[emotion] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function analyzeTriggers(
  entries: IEntry[]
): Array<{ trigger: string; count: number }> {
  const counts: Record<string, number> = {};

  entries.forEach((entry) => {
    entry.triggers.forEach((trigger) => {
      counts[trigger] = (counts[trigger] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export { analyzeEmotions, analyzeTriggers };
