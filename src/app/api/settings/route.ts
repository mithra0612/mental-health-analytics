import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Entry from "@/models/Entry";
import Analytics from "@/models/Analytics";
import { getSession, clearSession, hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.id).select("-passwordHash");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { name, purposes, notifications, password } = body;

    const updateData: Record<string, unknown> = {};

    if (name) {
      updateData["profile.name"] = name;
    }

    if (purposes !== undefined) {
      updateData["preferences.purposes"] = purposes;
    }

    if (notifications !== undefined) {
      updateData["preferences.notifications"] = notifications;
    }

    if (password) {
      updateData.passwordHash = await hashPassword(password);
    }

    const user = await User.findByIdAndUpdate(session.id, updateData, {
      new: true,
    }).select("-passwordHash");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    await Entry.deleteMany({ userId: session.id });
    await Analytics.deleteMany({ userId: session.id });
    await User.findByIdAndDelete(session.id);
    await clearSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
