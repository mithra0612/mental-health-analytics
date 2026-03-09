import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Entry from "@/models/Entry";
import { hashPassword } from "@/lib/auth";

async function seedDatabase() {
  await dbConnect();

  // Clear existing data
  await User.deleteMany({});
  await Entry.deleteMany({});

  // Create test user
  const hashedPassword = await hashPassword("password123");
  const testUser = await User.create({
    email: "test@example.com",
    passwordHash: hashedPassword,
    profile: {
      name: "Test User",
    },
    preferences: {
      dailyReminderTime: "09:00",
      emailNotifications: true,
    },
    onboardingCompleted: true,
  });

  const userId = testUser._id.toString();

  // Create sample entries for the last 30 days
  const emotions = [
    ["Calm", "Happy"],
    ["Anxious", "Stressed"],
    ["Happy", "Energized"],
    ["Sad", "Overwhelmed"],
    ["Calm", "Hopeful"],
    ["Stressed", "Tired"],
    ["Happy", "Calm"],
    ["Anxious", "Tired"],
    ["Energized", "Happy"],
    ["Calm", "Focused"],
  ];

  const triggers = [
    ["Work deadline", "Sleep deprivation"],
    ["Social interaction"],
    ["Exercise", "Good sleep"],
    ["Conflict", "Work stress"],
    ["Meditation", "Rest day"],
    ["Too much caffeine", "Workload"],
    ["Relaxation", "Friends"],
    ["Anxiety", "Work"],
    ["Morning run", "Positive feedback"],
    ["Deadlines", "Health"],
  ];

  const notes = [
    "Had a good day at work. Feeling positive.",
    "Struggled with anxiety today. Need to work on stress management.",
    "Great workout session. Feeling energized and accomplished.",
    "Challenging day. Had a conflict with a colleague.",
    "Peaceful day. Spent time meditating and reflecting.",
    "Tired from late-night work. Need more sleep.",
    "Amazing day! Everything went well.",
    "Feeling a bit anxious. Starting a new project.",
    "Great morning run. Energy levels are high.",
    "Productive day. Made progress on goals.",
  ];

  const entries = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(12, 0, 0, 0);

    const mood = Math.floor(Math.random() * 4) + 2; // 2-5
    const stress = Math.floor(Math.random() * 7) + 2; // 2-8
    const sleep = Math.floor(Math.random() * 4) + 6; // 6-10 hours

    entries.push({
      userId,
      date,
      mood,
      stress,
      sleep,
      emotions: emotions[i % emotions.length],
      triggers: triggers[i % triggers.length],
      notes: notes[i % notes.length],
    });
  }

  await Entry.insertMany(entries);

  return {
    success: true,
    user: {
      id: testUser._id,
      email: testUser.email,
      name: testUser.profile.name,
    },
    credentials: {
      email: "test@example.com",
      password: "password123",
    },
    sampleData: {
      entriesCreated: entries.length,
      dateRange: `Last 30 days`,
    },
  };
}

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
