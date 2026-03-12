import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Entry from "@/models/Entry";
import { hashPassword, getSession } from "@/lib/auth";

// Deterministic pseudo-random helper (no Math.random so data is reproducible)
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

async function seedDatabase() {
  await dbConnect();

  // If a user is already logged in, seed entries for them.
  // Otherwise fall back to creating a demo account.
  const session = await getSession();
  let userId: string;

  if (session?.id) {
    userId = session.id;
    // Remove old entries for this user so we start fresh
    await Entry.deleteMany({ userId });
  } else {
    // Create / reset demo account
    await User.deleteMany({ email: "demo@mindtrack.app" });
    const hashedPassword = await hashPassword("Demo1234!");
    const testUser = await User.create({
      email: "demo@mindtrack.app",
      passwordHash: hashedPassword,
      profile: { name: "Alex Johnson" },
      preferences: {
        purposes: ["Reduce stress", "Improve sleep", "Track mood patterns"],
        stressBaseline: 5,
        sleepHours: 8,
        goals: ["Better sleep hygiene", "Daily mindfulness"],
        notifications: true,
      },
      onboardingCompleted: true,
    });
    userId = testUser._id.toString();
    await Entry.deleteMany({ userId });
  }

  // --- Static content pools ---
  const emotionSets = [
    ["Calm", "Content"],
    ["Happy", "Energized"],
    ["Anxious", "Stressed"],
    ["Sad", "Overwhelmed"],
    ["Hopeful", "Motivated"],
    ["Tired", "Drained"],
    ["Focused", "Productive"],
    ["Irritable", "Frustrated"],
    ["Grateful", "Peaceful"],
    ["Lonely", "Melancholy"],
    ["Excited", "Curious"],
    ["Nervous", "Worried"],
  ];

  const triggerSets = [
    ["Good sleep", "Morning exercise"],
    ["Work deadline", "Long meeting"],
    ["Social interaction", "Team lunch"],
    ["Conflict with colleague", "Heavy workload"],
    ["Meditation session", "Reading"],
    ["Poor sleep", "Skipped breakfast"],
    ["Completed project", "Positive feedback"],
    ["Traffic", "Running late"],
    ["Family time", "Weekend rest"],
    ["News overload", "Comparison thoughts"],
    ["Outdoor walk", "Fresh air"],
    ["Too much caffeine", "Irregular schedule"],
  ];

  const notePool = [
    "Woke up feeling refreshed. Morning routine helped set a positive tone for the day.",
    "Had a productive morning but afternoon was derailed by back-to-back meetings.",
    "Struggled to focus today. Mind kept wandering to upcoming deadlines.",
    "Great workout at the gym. Energy levels have been high all day.",
    "Feeling a bit under the weather but managed to complete all tasks.",
    "Had a difficult conversation with my manager. Trying to reframe it positively.",
    "Spent the evening reading — a quiet, restorative night.",
    "Anxiety crept in mid-afternoon. Did a 10-minute breathing exercise which helped.",
    "Caught up with an old friend over coffee. Mood immediately lifted.",
    "Battled procrastination most of the day but pushed through and finished strong.",
    "Mindfulness practice in the morning made a noticeable difference.",
    "Feeling overwhelmed by the number of tasks on my plate.",
    "Had a really nice lunch break — ate outside and sat in the sun.",
    "Slept poorly last night and it affected my concentration throughout the day.",
    "Hit a personal milestone at work! Proud of the progress made.",
    "Evening walk helped clear my head after a mentally taxing day.",
    "Struggled with negative self-talk today. Reminded myself to be patient.",
    "Very social day — energizing but also a little draining by evening.",
    "Quiet, focused work session in the morning. Felt in flow.",
    "Late night working. Should set better boundaries with work hours.",
    "Practiced gratitude journaling before bed. Good way to end the day.",
    "Had a headache most of the afternoon — possibly dehydration.",
    "Enjoyed cooking dinner. A small thing that brought unexpected joy.",
    "Worried about finances today. Took stock of the situation — manageable.",
    "Positive therapy session. Making real progress on stress management.",
    "Watched a documentary instead of doom-scrolling. Much better choice.",
    "Forgot to take breaks during work. Body is tense tonight.",
    "Organized my workspace — instant mood booster.",
    "Called my parents tonight. Always recharges me emotionally.",
    "Challenging day but going to bed with a sense of accomplishment.",
  ];

  const entries = [];
  const totalDays = 90;

  for (let i = totalDays; i >= 1; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(20, 0, 0, 0); // evening entry

    const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Seed index for deterministic values
    const s = i * 7;

    // Realistic patterns: better mood on weekends, worse stress mid-week
    const moodBase = isWeekend ? 3.8 : 3.2;
    const stressBase = isWeekend ? 3.5 : 5.5;
    const sleepBase = isWeekend ? 8.2 : 7.0;

    // Add phased trend: improvement over time (lower stress, higher mood)
    const progressFactor = (totalDays - i) / totalDays; // 0 → 1 over 90 days
    const moodTrend = progressFactor * 0.8;
    const stressTrend = -progressFactor * 1.2;

    // Add noise
    const moodNoise = (seededRand(s) - 0.5) * 1.5;
    const stressNoise = (seededRand(s + 1) - 0.5) * 2;
    const sleepNoise = (seededRand(s + 2) - 0.5) * 1.5;

    const mood = Math.min(10, Math.max(1, Math.round((moodBase + moodTrend + moodNoise) * 10) / 10));
    const stress = Math.min(10, Math.max(1, Math.round((stressBase + stressTrend + stressNoise) * 10) / 10));
    const sleep = Math.min(12, Math.max(4, Math.round((sleepBase + sleepNoise) * 10) / 10));

    const emotionIdx = Math.floor(seededRand(s + 3) * emotionSets.length);
    const triggerIdx = Math.floor(seededRand(s + 4) * triggerSets.length);
    const noteIdx = Math.floor(seededRand(s + 5) * notePool.length);

    entries.push({
      userId,
      date,
      mood: Math.round(mood),
      stress: Math.round(stress),
      sleep: Math.round(sleep * 2) / 2, // round to nearest 0.5
      emotions: emotionSets[emotionIdx],
      triggers: triggerSets[triggerIdx],
      notes: notePool[noteIdx],
    });
  }

  await Entry.insertMany(entries);

  return {
    success: true,
    credentials: { email: "demo@mindtrack.app", password: "Demo1234!" },
    entriesCreated: entries.length,
    dateRange: `Last ${totalDays} days`,
  };
}

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}

