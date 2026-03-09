"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TodayStatusCard } from "@/components/dashboard/overview/TodayStatusCard";
import { QuickStatsCards } from "@/components/dashboard/overview/QuickStatsCards";
import { StreakWidget } from "@/components/dashboard/overview/StreakWidget";
import { QuickActionBar } from "@/components/dashboard/overview/QuickActionBar";
import { useToast } from "@/components/ui/use-toast";
import { Smile, Moon, Brain, BookOpen, TrendingDown, TrendingUp, ArrowRight, Calendar, Activity, type LucideIcon } from "lucide-react";
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
  entries?: IEntry[];
}

type WeekDay = { label: string; date: string; mood: number | null; hasEntry: boolean };
type Insight = { icon: LucideIcon; text: string; color: string };

export default function OverviewPage() {
  const [todayEntry, setTodayEntry] = useState<IEntry | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [recentEntries, setRecentEntries] = useState<IEntry[]>([]);
  const [weekData, setWeekData] = useState<WeekDay[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
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

        // Process entries for supplementary sections
        const allEntries: IEntry[] = analyticsData.entries || [];
        setRecentEntries(allEntries.slice(0, 5));
        setWeekData(buildWeekData(allEntries));
        setInsights(generateInsights(analyticsData));

        // Calculate streak
        calculateStreak(entryData.entries);
      } catch (error) {
        console.error("Failed to fetch overview data:", error);
        toast({
          title: "Error",
          description: "Failed to load overview data",
          variant: "destructive",
        });

        // Fallback sample data
        const sampleEntries: IEntry[] = [
          { _id: "1", userId: "user1", date: new Date(), mood: 4, stress: 5, sleep: 7, emotions: ["happy"], notes: "Sample note", triggers: ["work"], createdAt: new Date(), updatedAt: new Date() },
          { _id: "2", userId: "user1", date: new Date(Date.now() - 86400000), mood: 3, stress: 6, sleep: 6, emotions: ["tired"], notes: "Sample note", triggers: ["exercise"], createdAt: new Date(), updatedAt: new Date() },
        ];

        const sampleAnalytics: AnalyticsData = {
          summary: {
            entriesLogged: 2,
            moodAverage: 3.5,
            sleepAverage: 6.5,
            stressAverage: 5.5,
          },
          period: "30d",
          dateRange: { start: new Date(Date.now() - 30 * 86400000), end: new Date() },
          entries: sampleEntries,
        };

        setTodayEntry(sampleEntries[0]);
        setAnalytics(sampleAnalytics);
        setRecentEntries(sampleEntries);
        setWeekData(buildWeekData(sampleEntries));
        setInsights(generateInsights(sampleAnalytics));
        calculateStreak(sampleEntries);
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

  const buildWeekData = (entries: IEntry[]): WeekDay[] => {
    const days: WeekDay[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dateStr = d.toISOString().split("T")[0];
      const entry = entries.find((e) => {
        const ed = new Date(e.date);
        return ed.toISOString().split("T")[0] === dateStr;
      });
      days.push({
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: dateStr,
        mood: entry?.mood ?? null,
        hasEntry: !!entry,
      });
    }
    return days;
  };

  const generateInsights = (data: AnalyticsData): Insight[] => {
    const result: Insight[] = [];
    const s = data?.summary;
    if (!s || s.entriesLogged === 0) return result;

    if (s.moodAverage >= 4) {
      result.push({ icon: TrendingUp, text: `Great mood trend! Your 30-day average is ${s.moodAverage.toFixed(1)}/5.`, color: "text-green-500" });
    } else if (s.moodAverage < 3) {
      result.push({ icon: TrendingDown, text: `Your mood has averaged ${s.moodAverage.toFixed(1)}/5. Consider relaxation or reaching out for support.`, color: "text-amber-500" });
    }

    if (s.sleepAverage < 6) {
      result.push({ icon: Moon, text: `You're averaging ${s.sleepAverage.toFixed(1)}h sleep — below the recommended 7–9 hours.`, color: "text-blue-400" });
    } else if (s.sleepAverage >= 7) {
      result.push({ icon: Moon, text: `Solid sleep at ${s.sleepAverage.toFixed(1)}h avg — good sleep supports mood and focus.`, color: "text-blue-400" });
    }

    if (s.stressAverage >= 7) {
      result.push({ icon: Brain, text: `Stress is elevated at ${s.stressAverage.toFixed(1)}/10. Try short mindfulness breaks or light exercise.`, color: "text-orange-400" });
    } else if (s.stressAverage <= 4) {
      result.push({ icon: Brain, text: `Stress is well-managed at ${s.stressAverage.toFixed(1)}/10. Keep it up!`, color: "text-green-500" });
    }

    if (s.entriesLogged >= 20) {
      result.push({ icon: Activity, text: `${s.entriesLogged} entries logged this month — excellent consistency!`, color: "text-purple-400" });
    } else if (s.entriesLogged < 7) {
      result.push({ icon: Activity, text: `Try logging more regularly. Consistent tracking reveals better wellness patterns.`, color: "text-muted-foreground" });
    }

    return result;
  };

  const stats = [
    {
      label: "Avg Mood",
      value:
        analytics?.summary?.moodAverage
          ? parseFloat(analytics.summary.moodAverage.toString()).toFixed(1)
          : null,
      subtext: "Last 30 days",
      icon: Smile,
    },
    {
      label: "Avg Sleep",
      value:
        analytics?.summary?.sleepAverage
          ? parseFloat(analytics.summary.sleepAverage.toString()).toFixed(1) + "h"
          : null,
      subtext: "Last 30 days",
      icon: Moon,
    },
    {
      label: "Avg Stress",
      value:
        analytics?.summary?.stressAverage
          ? parseFloat(analytics.summary.stressAverage.toString()).toFixed(1)
          : null,
      subtext: "Last 30 days",
      icon: Brain,
    },
    {
      label: "Entries",
      value: analytics?.summary?.entriesLogged ?? 0,
      subtext: "Last 30 days",
      icon: BookOpen,
    },
  ];

  return (
    <div>
      <DashboardHeader
        title="Overview"
        description="Your mental wellness at a glance"
      />
      <div className="p-6 space-y-4">
        {/* Quick Actions */}
        <QuickActionBar
          onLogEntry={() => router.push("/dashboard/journal")}
          onAskAssistant={() => router.push("/dashboard/assistant")}
          isLoading={isLoading}
        />

        {/* Stats grid */}
        <QuickStatsCards stats={stats} isLoading={isLoading} />

        {/* Today + Streak row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-3">
            <TodayStatusCard
              mood={todayEntry?.mood}
              stress={todayEntry?.stress}
              sleep={todayEntry?.sleep}
              isLoading={isLoading}
              onLogEntry={() => router.push("/dashboard/journal")}
            />
          </div>
          <div className="md:col-span-2">
            <StreakWidget currentStreak={streak} isLoading={isLoading} />
          </div>
        </div>

        {/* 7-Day Mood Trend + Recent Entries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 7-Day bar chart */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-foreground">7-Day Mood</p>
              <span className="text-xs text-muted-foreground">This week</span>
            </div>
            {isLoading ? (
              <div className="flex items-end gap-2 h-20">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex-1 shimmer rounded" style={{ height: "60%" }} />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-end gap-1.5 h-20">
                  {weekData.map((day) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className={`w-full rounded transition-all duration-300 ${
                          day.hasEntry
                            ? "bg-foreground/70 hover:bg-foreground"
                            : "bg-secondary"
                        }`}
                        style={{
                          height: day.mood ? `${(day.mood / 5) * 100}%` : "4px",
                          minHeight: "4px",
                        }}
                        title={
                          day.hasEntry
                            ? `${day.label}: ${day.mood}/5`
                            : `${day.label}: No entry`
                        }
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {day.label.slice(0, 2)}
                      </span>
                    </div>
                  ))}
                </div>
                {weekData.filter((d) => d.hasEntry).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    No entries this week
                  </p>
                )}
              </>
            )}
          </div>

          {/* Recent Entries */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-foreground">Recent Entries</p>
              <button
                onClick={() => router.push("/dashboard/journal")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="shimmer h-10 rounded-lg" />
                ))}
              </div>
            ) : recentEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No entries yet. Start logging!
              </p>
            ) : (
              <div className="space-y-2">
                {recentEntries.slice(0, 4).map((entry) => (
                  <div
                    key={String(entry._id)}
                    className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2.5 hover:bg-secondary/60 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Smile className="h-3 w-3" />{entry.mood}/5
                      </span>
                      <span className="flex items-center gap-1">
                        <Brain className="h-3 w-3" />{entry.stress}/10
                      </span>
                      <span className="flex items-center gap-1">
                        <Moon className="h-3 w-3" />{entry.sleep}h
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Wellness Insights */}
        {!isLoading && insights.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-medium text-foreground mb-3">Wellness Insights</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-lg bg-secondary/30 px-3 py-2.5 hover:bg-secondary/50 transition-colors"
                >
                  <insight.icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${insight.color}`} />
                  <p className="text-xs text-foreground/80 leading-relaxed">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
