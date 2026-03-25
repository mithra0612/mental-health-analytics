import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";

const EMOTIONS = ["Happy", "Calm", "Anxious", "Stressed", "Tired", "Energetic", "Sad", "Motivated"];
const TRIGGERS = ["Work", "Family", "Health", "Finance", "Social", "Sleep", "Exercise"];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElements(arr: string[], num: number) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

export async function GET() {
  try {
    await dbConnect();

    // Find or create demo user
    let user = await User.findOne({ email: "demo@example.com" });
    if (!user) {
      const passwordHash = await hashPassword("password123");
      user = await User.create({
        email: "demo@example.com",
        passwordHash,
        profile: { name: "Demo User" },
        preferences: {
          purposes: [],
          stressBaseline: 5,
          sleepHours: 8,
          goals: [],
          notifications: true,
        },
        dashboardConfig: {
          showMoodChart: true,
          showSleepChart: true,
          showStressChart: true,
        },
        onboardingCompleted: true,
      });
    }

    const userId = user._id.toString();
    const entriesToInsert = [];
    const now = new Date();

    for (let i = 0; i < 90; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // check if entry exists
      const existing = await Entry.findOne({ userId, date });
      if (existing) {
        continue;
      }

      // Generate somewhat realistic correlated data
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseMood = isWeekend ? 4 : 3;
      const mood = Math.max(1, Math.min(5, getRandomInt(baseMood - 1, baseMood + 1)));

      let stress = 10 - (mood * 2) + getRandomInt(-2, 2);
      stress = Math.max(1, Math.min(10, stress));

      let sleep = isWeekend ? getRandomInt(7, 9) : getRandomInt(5, 8);

      const emotions = getRandomElements(EMOTIONS, getRandomInt(1, 3));
      const triggers = getRandomElements(TRIGGERS, getRandomInt(0, 2));

      entriesToInsert.push({
        userId,
        date,
        mood,
        stress,
        sleep,
        emotions,
        triggers,
        notes: `Seed entry for ${date.toISOString().split("T")[0]}`,
      });
    }

    if (entriesToInsert.length > 0) {
      await Entry.insertMany(entriesToInsert);
    }
    
    return NextResponse.json({
      message: "Successfully loaded demo data.",
      credentials: { email: "demo@example.com", password: "password123" }
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
