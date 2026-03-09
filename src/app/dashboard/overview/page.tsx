"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TodayStatusCard } from "@/components/dashboard/overview/TodayStatusCard";
import { QuickStatsCards } from "@/components/dashboard/overview/QuickStatsCards";
import { StreakWidget } from "@/components/dashboard/overview/StreakWidget";
import { QuickActionBar } from "@/components/dashboard/overview/QuickActionBar";
import { useToast } from "@/components/ui/use-toast";
import type { IEntry } from "@/types";

interface AnalyticsData {
  summary?: {
    entriesLogged: number;
    moodAverage: number;
    sleepAverage: number;
    stressAverage: number;
  };
  period?: string;
  dateRange?: { start: Date; end: Date };
}

export default function OverviewPage() {
  const [todayEntry, setTodayEntry] = useState<IEntry | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const dateStr = today.toISOString().split("T")[0];

        // Fetch today's entry
        const entryRes = await fetch(`/api/entries?date=${dateStr}`);
        if (entryRes.status === 401) {
          router.push("/login");
          return;
        }

        const analyticsRes = await fetch("/api/analytics?period=30d");
        if (analyticsRes.status === 401) {
          router.push("/login");
          return;
        }

        const entryData = await entryRes.json();
        const analyticsData = await analyticsRes.json();

        if (entryData.entries && entryData.entries.length > 0) {
          setTodayEntry(entryData.entries[0]);
        }

        setAnalytics(analyticsData);

        // Calculate streak
        calculateStreak(entryData.entries);
      } catch (error) {
        console.error("Failed to fetch overview data:", error);
        toast({
          title: "Error",
          description: "Failed to load overview data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, toast]);

  const calculateStreak = (entries: IEntry[]) => {
    if (!entries || entries.length === 0) {
      setStreak(0);
      return;
    }

    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort entries by date descending
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - entryDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === count) {
        count++;
      } else {
        break;
      }
    }

    setStreak(count);
  };

  const stats = [
    {
      label: "Average Mood",
      value:
        analytics?.summary?.moodAverage &&
        parseFloat(analytics.summary.moodAverage.toString()).toFixed(1),
      subtext: "Last 30 days",
    },
    {
      label: "Average Sleep",
      value:
        analytics?.summary?.sleepAverage &&
        parseFloat(analytics.summary.sleepAverage.toString()).toFixed(1) + "h",
      subtext: "Last 30 days",
    },
    {
      label: "Average Stress",
      value:
        analytics?.summary?.stressAverage &&
        parseFloat(analytics.summary.stressAverage.toString()).toFixed(1),
      subtext: "Last 30 days",
    },
    {
      label: "Entries Logged",
      value: analytics?.summary?.entriesLogged || 0,
      subtext: "Last 30 days",
    },
  ];

  return (
    <div>
      <DashboardHeader
        title="Overview"
        description="Your mental wellness at a glance"
      />
      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <QuickActionBar
          onLogEntry={() => router.push("/dashboard/journal")}
          onAskAssistant={() => router.push("/dashboard/assistant")}
          isLoading={isLoading}
        />

        {/* Today's Status */}
        <TodayStatusCard
          mood={todayEntry?.mood}
          stress={todayEntry?.stress}
          sleep={todayEntry?.sleep}
          isLoading={isLoading}
          onLogEntry={() => router.push("/dashboard/journal")}
        />

        {/* Quick Stats */}
        <QuickStatsCards stats={stats} isLoading={isLoading} />

        {/* Streak Widget */}
        <StreakWidget currentStreak={streak} isLoading={isLoading} />

        {/* Info message */}
        <div className="p-4 bg-muted rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            More overview features coming soon including insights, charts, and
            activity timeline.
          </p>
        </div>
      </div>
    </div>
  );
}
