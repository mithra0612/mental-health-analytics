import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import dbConnect from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeAnalytics } from "@/lib/analytics";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function buildSystemPrompt(analytics: Awaited<ReturnType<typeof computeAnalytics>>): string {
  return `You are a warm, empathetic mental wellness assistant integrated into a personal mental health tracking app. You have access to the user's recent wellness data and provide thoughtful, personalized guidance.

User's current wellness data:
- Weekly mood average: ${analytics.weeklyMoodAvg}/5
- Sleep average: ${analytics.sleepAvg} hours/night
- Stress trend: ${analytics.stressTrend > 0 ? "increasing" : analytics.stressTrend < 0 ? "decreasing" : "stable"}
- Current logging streak: ${analytics.streak} days

Guidelines:
- Be warm, supportive, and non-judgmental
- Give practical, actionable advice tailored to their data
- Keep responses concise (2-4 sentences) and conversational
- Include 2-3 specific suggestions when relevant
- Always remind users you are not a medical professional for serious concerns
- If asked about topics outside mental wellness, gently redirect to wellness topics
- Format suggestions as a simple list when providing them`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured. Please add it to your .env.local file." },
        { status: 503 }
      );
    }

    const analytics = await computeAnalytics(session.id);
    const systemPrompt = buildSystemPrompt(analytics);

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(history)
        ? history.slice(-10).map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }))
        : []),
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 512,
    });

    const reply = completion.choices[0]?.message?.content ?? "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({ message: reply });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[chat/route] error:", message);
    return NextResponse.json(
      { error: message || "Internal server error" },
      { status: 500 }
    );
  }
}
