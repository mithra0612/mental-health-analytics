import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getMoodEmoji(mood: number): string {
  const emojis = ["😢", "😔", "😐", "🙂", "😊"];
  return emojis[mood - 1] || "😐";
}

export function getMoodLabel(mood: number): string {
  const labels = ["Very Bad", "Bad", "Neutral", "Good", "Very Good"];
  return labels[mood - 1] || "Neutral";
}

export function getStressLabel(stress: number): string {
  if (stress <= 2) return "Low";
  if (stress <= 4) return "Moderate";
  if (stress <= 6) return "High";
  return "Very High";
}

export function calculateStreak(entries: { date: Date }[]): number {
  if (entries.length === 0) return 0;
  
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].date);
    entryDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    
    if (entryDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}
