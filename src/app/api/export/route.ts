import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const entries = await Entry.find({ userId: session.id }).sort({ date: -1 });

    const exportData = {
      exportDate: new Date().toISOString(),
      userId: session.id,
      entries: entries.map((entry) => ({
        date: entry.date,
        mood: entry.mood,
        stress: entry.stress,
        sleep: entry.sleep,
        emotions: entry.emotions,
        notes: entry.notes,
        triggers: entry.triggers,
      })),
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="mental-health-data-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
