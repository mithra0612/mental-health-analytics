import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getSession, setSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { purposes, stressBaseline, sleepHours, goals } = body;

    const user = await User.findByIdAndUpdate(
      session.id,
      {
        preferences: {
          purposes: purposes || [],
          stressBaseline: stressBaseline || 5,
          sleepHours: sleepHours || 8,
          goals: goals || [],
          notifications: true,
        },
        onboardingCompleted: true,
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await setSession({
      id: user._id!.toString(),
      email: user.email,
      name: user.profile.name,
      onboardingCompleted: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
