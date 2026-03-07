import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeAnalytics } from "@/lib/analytics";
import type { IAnalytics } from "@/types";

interface ChatResponse {
  message: string;
  suggestions: string[];
}

function generateChatResponse(
  userMessage: string,
  analytics: IAnalytics
): ChatResponse {
  const message = userMessage.toLowerCase();
  const response: ChatResponse = {
    message: "",
    suggestions: [],
  };

  if (message.includes("mood") || message.includes("feeling")) {
    if (analytics.weeklyMoodAvg >= 4) {
      response.message =
        "Your mood has been great this week! Your average is " +
        analytics.weeklyMoodAvg +
        "/5. Keep doing what you're doing - it's clearly working for you.";
      response.suggestions = [
        "Continue your current routine",
        "Share what's been working with someone",
        "Journal about positive moments",
      ];
    } else if (analytics.weeklyMoodAvg >= 3) {
      response.message =
        "Your mood has been moderate this week with an average of " +
        analytics.weeklyMoodAvg +
        "/5. There's room for improvement, but you're doing okay.";
      response.suggestions = [
        "Try adding one enjoyable activity daily",
        "Connect with friends or family",
        "Consider what might be affecting your mood",
      ];
    } else {
      response.message =
        "I notice your mood has been lower than usual this week (" +
        analytics.weeklyMoodAvg +
        "/5). Remember that it's okay to have difficult times, and reaching out for support is a sign of strength.";
      response.suggestions = [
        "Talk to someone you trust",
        "Practice self-compassion",
        "Consider professional support if feelings persist",
        "Focus on basic self-care: sleep, nutrition, movement",
      ];
    }
  } else if (message.includes("sleep") || message.includes("tired") || message.includes("rest")) {
    if (analytics.sleepAvg >= 7 && analytics.sleepAvg <= 9) {
      response.message =
        "Your sleep has been in the healthy range at " +
        analytics.sleepAvg +
        " hours average. Good sleep is foundational for mental health!";
      response.suggestions = [
        "Maintain your consistent sleep schedule",
        "Create a relaxing bedtime routine",
        "Keep your sleep environment comfortable",
      ];
    } else if (analytics.sleepAvg < 7) {
      response.message =
        "You've been averaging " +
        analytics.sleepAvg +
        " hours of sleep, which is below the recommended 7-9 hours. Sleep deprivation can significantly impact mood and stress levels.";
      response.suggestions = [
        "Set a consistent bedtime",
        "Avoid screens 1 hour before bed",
        "Limit caffeine after noon",
        "Create a dark, cool sleeping environment",
      ];
    } else {
      response.message =
        "You're averaging " +
        analytics.sleepAvg +
        " hours of sleep. While everyone's needs differ, sleeping too much can sometimes indicate other issues.";
      response.suggestions = [
        "Set an alarm to maintain consistency",
        "Get sunlight exposure in the morning",
        "Ensure you're getting quality sleep, not just quantity",
      ];
    }
  } else if (message.includes("stress") || message.includes("anxious") || message.includes("worried")) {
    if (analytics.stressTrend > 0) {
      response.message =
        "Your stress levels have been increasing lately. It's important to address this before it affects other areas of your wellbeing.";
      response.suggestions = [
        "Practice deep breathing exercises",
        "Try the 5-4-3-2-1 grounding technique",
        "Take regular breaks during work",
        "Identify and limit stress triggers",
        "Consider meditation or mindfulness apps",
      ];
    } else if (analytics.stressTrend < 0) {
      response.message =
        "Great news - your stress levels have been decreasing! Whatever strategies you're using seem to be working.";
      response.suggestions = [
        "Continue your stress management practices",
        "Note what's been helping for future reference",
        "Help others by sharing your strategies",
      ];
    } else {
      response.message =
        "Your stress levels have been relatively stable. Maintaining consistent stress management practices is key.";
      response.suggestions = [
        "Regular exercise can help manage stress",
        "Ensure you have work-life boundaries",
        "Schedule time for activities you enjoy",
      ];
    }
  } else if (message.includes("streak") || message.includes("progress") || message.includes("habit")) {
    if (analytics.streak >= 7) {
      response.message =
        "Amazing! You have a " +
        analytics.streak +
        "-day logging streak! Consistency in self-reflection is a powerful tool for mental wellness.";
      response.suggestions = [
        "Celebrate this achievement",
        "Set a new streak goal",
        "Review your patterns over time",
      ];
    } else if (analytics.streak >= 3) {
      response.message =
        "You're building a habit with your " +
        analytics.streak +
        "-day streak! Keep going - habits typically solidify after 21 days.";
      response.suggestions = [
        "Set a daily reminder",
        "Log at the same time each day",
        "Keep your entries brief when needed",
      ];
    } else {
      response.message =
        "Starting fresh is always an option. Every entry helps you understand yourself better.";
      response.suggestions = [
        "Try logging at the same time daily",
        "Start with just mood and sleep tracking",
        "Be patient with yourself",
      ];
    }
  } else if (message.includes("help") || message.includes("what can you do")) {
    response.message =
      "I'm here to help you understand your mental health patterns. I can discuss your mood trends, sleep patterns, stress levels, and progress. I'll provide personalized insights based on your logged data. Note: I'm not a medical professional - for serious concerns, please consult a healthcare provider.";
    response.suggestions = [
      "Ask about your mood patterns",
      "Check your sleep analysis",
      "Discuss stress management",
      "Review your logging progress",
    ];
  } else {
    response.message =
      "I'm here to help you understand your mental health data. Based on your recent entries, your mood average is " +
      analytics.weeklyMoodAvg +
      "/5, you're sleeping " +
      analytics.sleepAvg +
      " hours on average, and you have a " +
      analytics.streak +
      "-day logging streak. What would you like to explore?";
    response.suggestions = [
      "Tell me about my mood",
      "How is my sleep?",
      "Help me manage stress",
      "What's my progress?",
    ];
  }

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const analytics = await computeAnalytics(session.id);
    const response = generateChatResponse(message, analytics);

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
