import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Habit from "@/models/Habit";
import Goal from "@/models/Goal";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get("goalId");

    const query: Record<string, string> = { userId: session.id };
    if (goalId) query.goalId = goalId;

    const habits = await Habit.find(query);

    return NextResponse.json({ habits });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
    const { goalId } = body;

    if (!goalId) {
      return NextResponse.json({ error: "goalId is required" }, { status: 400 });
    }

    const goal = await Goal.findOne({ _id: goalId, userId: session.id });
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    let habit = await Habit.findOne({ goalId, userId: session.id });
    if (!habit) {
      habit = new Habit({
        userId: session.id,
        goalId,
        completedDates: [],
        streak: 0,
        longestStreak: 0,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyDone = habit.completedDates.some((d: Date) => {
      const dDate = new Date(d);
      dDate.setHours(0, 0, 0, 0);
      return dDate.getTime() === today.getTime();
    });

    if (alreadyDone) {
      habit.completedDates = habit.completedDates.filter((d: Date) => {
        const dDate = new Date(d);
        dDate.setHours(0, 0, 0, 0);
        return dDate.getTime() !== today.getTime();
      });
    } else {
      habit.completedDates.push(today);
    }

    // Recalculate streak from sorted dates (descending)
    const sortedDates = [...habit.completedDates].sort(
      (a: Date, b: Date) => new Date(b).getTime() - new Date(a).getTime()
    );
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    for (const d of sortedDates) {
      const dDate = new Date(d);
      dDate.setHours(0, 0, 0, 0);
      if (dDate.getTime() === cursor.getTime()) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    habit.streak = streak;
    if (streak > habit.longestStreak) habit.longestStreak = streak;

    // Update goal progress for habit/frequency goals
    if (goal.type === "habit" || goal.frequency) {
      goal.currentValue = habit.completedDates.length;
      if (goal.currentValue >= goal.targetValue && goal.status === "active") {
        goal.status = "completed";
      }
      await goal.save();
    }

    await habit.save();

    return NextResponse.json({ habit, completedToday: !alreadyDone });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
