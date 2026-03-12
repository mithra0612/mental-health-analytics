import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { hashPassword, setSession, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      profile: { name },
      preferences: {
        purposes: [],
        stressBaseline: 5,
        sleepHours: 8,
        goals: [],
        notifications: true,
      },
      dashboardConfig: {
        showMoodChart: true,
        showSleepChart: true,
        showStressChart: true,
      },
      onboardingCompleted: false,
    });

    const authUser = {
      id: user._id!.toString(),
      email: user.email,
      name: user.profile.name,
      onboardingCompleted: user.onboardingCompleted,
    };

    await setSession(authUser);
    const token = generateToken(authUser);

    return NextResponse.json({
      success: true,
      token,
      user: authUser,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
