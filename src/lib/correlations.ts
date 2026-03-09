import { IEntry } from "@/types";

export function calculatePearsonCorrelation(
  arr1: number[],
  arr2: number[]
): number {
  if (arr1.length !== arr2.length || arr1.length < 2) return 0;

  const n = arr1.length;
  const mean1 = arr1.reduce((a, b) => a + b) / n;
  const mean2 = arr2.reduce((a, b) => a + b) / n;

  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;

  for (let i = 0; i < n; i++) {
    const diff1 = arr1[i] - mean1;
    const diff2 = arr2[i] - mean2;
    numerator += diff1 * diff2;
    denominator1 += diff1 * diff1;
    denominator2 += diff2 * diff2;
  }

  const denominator = Math.sqrt(denominator1 * denominator2);
  return denominator === 0 ? 0 : numerator / denominator;
}

export function getSleepMoodCorrelation(entries: IEntry[]): {
  correlation: number;
  insight: string;
} {
  const sleep = entries.map((e) => e.sleep);
  const mood = entries.map((e) => e.mood);

  const corr = calculatePearsonCorrelation(sleep, mood);

  let insight = "";
  if (corr > 0.6) {
    insight = "Strong: More sleep strongly correlates with better mood";
  } else if (corr > 0.3) {
    insight = "Moderate: You tend to feel better with more sleep";
  } else if (corr < -0.3) {
    insight = "Your mood appears less dependent on sleep alone";
  } else {
    insight = "Sleep and mood show no strong correlation for you";
  }

  return { correlation: corr, insight };
}

export function getStressMoodCorrelation(entries: IEntry[]): {
  correlation: number;
  insight: string;
} {
  const stress = entries.map((e) => e.stress);
  const mood = entries.map((e) => e.mood);

  // Invert stress to show negative correlation makes sense
  const invertedStress = stress.map((s) => 11 - s);
  const corr = calculatePearsonCorrelation(invertedStress, mood);

  let insight = "";
  if (corr > 0.6) {
    insight = "Strong: Lower stress strongly correlates with better mood";
  } else if (corr > 0.3) {
    insight = "Moderate: Reducing stress helps your mood";
  } else {
    insight = "Stress and mood show limited correlation for you";
  }

  return { correlation: corr, insight };
}
