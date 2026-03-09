import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Goal from "@/models/Goal";
import Habit from "@/models/Habit";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const goal = await Goal.findOne({ _id: id, userId: session.id });
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await request.json();
    const { currentValue, status } = body;

    if (currentValue !== undefined) goal.currentValue = Number(currentValue);
    if (status) goal.status = status;

    if (goal.currentValue >= goal.targetValue && goal.status === "active") {
      goal.status = "completed";
    }

    await goal.save();

    return NextResponse.json({ goal });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const goal = await Goal.findOneAndDelete({ _id: id, userId: session.id });
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    await Habit.deleteMany({ goalId: id });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
