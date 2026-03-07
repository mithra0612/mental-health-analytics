"use client";

import { Smile, Frown, Meh, SmilePlus, Angry } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMoodEmoji, getMoodLabel } from "@/lib/utils";
import type { IAnalytics, IEntry } from "@/types";

interface StatsCardsProps {
  analytics: IAnalytics | null;
  todayEntry: IEntry | null;
}

export default function StatsCards({ analytics, todayEntry }: StatsCardsProps) {
  const getMoodIcon = (mood: number) => {
    const iconClass = "w-8 h-8";
    switch (mood) {
      case 1:
        return <Angry className={`${iconClass} text-red-500`} />;
      case 2:
        return <Frown className={`${iconClass} text-orange-500`} />;
      case 3:
        return <Meh className={`${iconClass} text-yellow-500`} />;
      case 4:
        return <Smile className={`${iconClass} text-lime-500`} />;
      case 5:
        return <SmilePlus className={`${iconClass} text-green-500`} />;
      default:
        return <Meh className={`${iconClass} text-gray-400`} />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <Card className="rounded-2xl shadow-sm border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Today&apos;s Mood
          </CardTitle>
          {getMoodIcon(todayEntry?.mood || 0)}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {todayEntry ? (
              <>
                <span className="text-3xl mr-2">{getMoodEmoji(todayEntry.mood)}</span>
                {getMoodLabel(todayEntry.mood)}
              </>
            ) : (
              <span className="text-muted-foreground">No entry yet</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {todayEntry ? "Logged today" : "Add your daily entry"}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Weekly Mood Avg
          </CardTitle>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">
              {analytics?.weeklyMoodAvg?.toFixed(1) || "—"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics?.weeklyMoodAvg
              ? getMoodLabel(Math.round(analytics.weeklyMoodAvg))
              : "No data"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on last 7 days
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Sleep Average
          </CardTitle>
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <span className="text-indigo-500 dark:text-indigo-400 font-semibold text-sm">💤</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics?.sleepAvg ? `${analytics.sleepAvg.toFixed(1)} hrs` : "No data"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics?.sleepAvg && analytics.sleepAvg >= 7
              ? "Healthy sleep range"
              : "Aim for 7-9 hours"}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Logging Streak
          </CardTitle>
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
            <span className="text-amber-500 dark:text-amber-400 font-semibold text-sm">🔥</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics?.streak || 0} days
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics?.streak && analytics.streak >= 7
              ? "Amazing consistency!"
              : "Keep building the habit"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
