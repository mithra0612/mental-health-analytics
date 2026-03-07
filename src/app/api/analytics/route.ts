import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeAnalytics, getWeeklyChartData, getTodayEntry } from "@/lib/analytics";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const analytics = await computeAnalytics(session.id);
    const chartData = await getWeeklyChartData(session.id);
    const todayEntry = await getTodayEntry(session.id);

    return NextResponse.json({
      analytics,
      chartData,
      todayEntry,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
