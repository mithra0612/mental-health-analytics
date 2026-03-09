import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getSession } from "@/lib/auth";
import Entry from "@/models/Entry";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    // Parse period
    let days = 30;
    if (period === "7d") days = 7;
    else if (period === "90d") days = 90;
    else if (period === "1y") days = 365;

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get entries for the period
    const entries = await Entry.find({
      userId: session.id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1 });

    let moodAverage = 0;
    let sleepAverage = 0;
    let stressAverage = 0;

    if (entries.length > 0) {
      const totalMood = entries.reduce((sum, entry) => sum + entry.mood, 0);
      moodAverage = parseFloat((totalMood / entries.length).toFixed(2));

      const totalSleep = entries.reduce((sum, entry) => sum + entry.sleep, 0);
      sleepAverage = parseFloat((totalSleep / entries.length).toFixed(2));

      const totalStress = entries.reduce((sum, entry) => sum + entry.stress, 0);
      stressAverage = parseFloat((totalStress / entries.length).toFixed(2));
    }

    return NextResponse.json({
      summary: {
        entriesLogged: entries.length,
        moodAverage,
        sleepAverage,
        stressAverage,
      },
      period,
      dateRange: {
        start: startDate,
        end: endDate,
      },
      entries,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
