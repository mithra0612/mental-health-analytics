import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
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
    const status = searchParams.get("status");

    const query: Record<string, string> = { userId: session.id };
    if (status) query.status = status;

    const goals = await Goal.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ goals });
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
    const { title, description, type, targetValue, unitOfMeasure, targetDate, frequency } = body;

    if (!title || !targetValue) {
      return NextResponse.json(
        { error: "Title and target value are required" },
        { status: 400 }
      );
    }

    const goal = new Goal({
      userId: session.id,
      title: String(title).trim(),
      description: description ? String(description).trim() : "",
      type: type || "custom",
      targetValue: Number(targetValue),
      currentValue: 0,
      unitOfMeasure: unitOfMeasure ? String(unitOfMeasure).trim() : "",
      status: "active",
      startDate: new Date(),
      targetDate: targetDate ? new Date(targetDate) : undefined,
      frequency: frequency || undefined,
    });

    await goal.save();

    return NextResponse.json({ goal }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
