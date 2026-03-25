import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('No MONGODB_URI found in .env.local');
  process.exit(1);
}

const EntrySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  mood: { type: Number, required: true, min: 1, max: 5 },
  stress: { type: Number, required: true, min: 1, max: 10 },
  sleep: { type: Number, required: true, min: 0, max: 24 },
  emotions: { type: [String], default: [] },
  notes: { type: String, default: "" },
  triggers: { type: [String], default: [] },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
});

const Entry = mongoose.models.Entry || mongoose.model("Entry", EntrySchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const EMOTIONS = ["Happy", "Calm", "Anxious", "Stressed", "Tired", "Energetic", "Sad", "Motivated"];
const TRIGGERS = ["Work", "Family", "Health", "Finance", "Social", "Sleep", "Exercise"];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElements(arr, num) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne();
    if (!user) {
      console.log('No user found to attach entries to. Please sign up first.');
      process.exit(0);
    }
    const userId = user._id.toString();

    console.log(`Seeding entries for user: ${userId}`);

    // Generate past 90 days of data
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
        // Weekends might have better mood and sleep
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        const baseMood = isWeekend ? 4 : 3;
        const mood = Math.max(1, Math.min(5, getRandomInt(baseMood - 1, baseMood + 1)));
        
        // High mood -> lower stress generally
        let stress = 10 - (mood * 2) + getRandomInt(-2, 2);
        stress = Math.max(1, Math.min(10, stress));

        // Sleep
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
            notes: `Seed entry for ${date.toISOString().split('T')[0]}`
        });
    }

    if (entriesToInsert.length > 0) {
        await Entry.insertMany(entriesToInsert);
        console.log(`Successfully inserted ${entriesToInsert.length} entries.`);
    } else {
        console.log('No new entries needed, dates already populated.');
    }

  } catch (err) {
    console.error('Error seeding DB:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
