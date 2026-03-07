import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import { getSession } from "@/lib/auth";
import { computeAnalytics } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "30");
    const offset = parseInt(searchParams.get("offset") || "0");

    const entries = await Entry.find({ userId: session.id })
      .sort({ date: -1 })
      .skip(offset)
      .limit(limit);

    const total = await Entry.countDocuments({ userId: session.id });

    return NextResponse.json({
      entries,
      total,
      hasMore: offset + entries.length < total,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { mood, stress, sleep, emotions, notes, triggers, date } = body;

    if (mood === undefined || stress === undefined || sleep === undefined) {
      return NextResponse.json(
        { error: "Mood, stress, and sleep are required" },
        { status: 400 }
      );
    }

    const entryDate = date ? new Date(date) : new Date();
    entryDate.setHours(12, 0, 0, 0);

    const startOfDay = new Date(entryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(entryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingEntry = await Entry.findOne({
      userId: session.id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    let entry;
    if (existingEntry) {
      entry = await Entry.findByIdAndUpdate(
        existingEntry._id,
        {
          mood,
          stress,
          sleep,
          emotions: emotions || [],
          notes: notes || "",
          triggers: triggers || [],
        },
        { new: true }
      );
    } else {
      entry = await Entry.create({
        userId: session.id,
        date: entryDate,
        mood,
        stress,
        sleep,
        emotions: emotions || [],
        notes: notes || "",
        triggers: triggers || [],
      });
    }

    await computeAnalytics(session.id);

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
