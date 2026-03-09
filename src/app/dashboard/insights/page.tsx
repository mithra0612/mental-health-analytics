"use client";

import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Smile, Moon, Brain, Activity, TrendingUp, TrendingDown } from "lucide-react";

export default function InsightsPage() {
  const insights = [
    {
      icon: Smile,
      title: "Mood Trends",
      description:
        "Your mood has been steadily improving over the past 30 days. Keep up the positive habits!",
      color: "text-green-500",
    },
    {
      icon: Moon,
      title: "Sleep Impact",
      description:
        "Consistent sleep of 7-8 hours has been linked to better mood and lower stress levels in your data.",
      color: "text-blue-500",
    },
    {
      icon: Brain,
      title: "Stress Patterns",
      description:
        "Stress levels tend to spike on weekdays. Consider mindfulness exercises or short breaks during work.",
      color: "text-red-500",
    },
    {
      icon: Activity,
      title: "Activity Consistency",
      description:
        "You’ve logged entries for 20 out of the last 30 days. Regular tracking helps identify patterns more effectively.",
      color: "text-purple-500",
    },
    {
      icon: TrendingUp,
      title: "Positive Correlations",
      description:
        "Higher mood scores are often associated with days where you logged outdoor activities or exercise.",
      color: "text-green-400",
    },
    {
      icon: TrendingDown,
      title: "Areas for Improvement",
      description:
        "Days with less than 6 hours of sleep show higher stress levels. Prioritize rest for better balance.",
      color: "text-amber-500",
    },
  ];

  return (
    <div>
      <DashboardHeader
        title="Insights"
        description="AI-generated patterns and recommendations"
      />
      <div className="p-6 space-y-6">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
          >
            <insight.icon className={`h-6 w-6 ${insight.color}`} />
            <div>
              <h3 className="text-lg font-medium text-foreground">{insight.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
