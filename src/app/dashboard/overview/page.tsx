"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TodayStatusCard } from "@/components/dashboard/overview/TodayStatusCard";
import { QuickStatsCards } from "@/components/dashboard/overview/QuickStatsCards";
import { StreakWidget } from "@/components/dashboard/overview/StreakWidget";
import { QuickActionBar } from "@/components/dashboard/overview/QuickActionBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Smile, Moon, Brain, BookOpen, TrendingDown, TrendingUp,
  ArrowRight, Calendar, Activity, Sparkles, type LucideIcon,
} from "lucide-react";
import type { IEntry } from "@/types";

interface AnalyticsData {
  summary?: {
    entriesLogged: number;
    moodAverage: number;
    sleepAverage: number;
    stressAverage: number;
  };
  period?: string;
  entries?: IEntry[];
}

type WeekDay = { label: string; date: string; mood: number | null; hasEntry: boolean };
type Insight = { icon: LucideIcon; text: string; type: "positive" | "warning" | "info" };

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

        const entryRes = await fetch(`/api/entries?date=${dateStr}`);
        if (entryRes.status === 401) { router.push("/login"); return; }

        const analyticsRes = await fetch("/api/analytics?period=30d");
        if (analyticsRes.status === 401) { router.push("/login"); return; }

        const entryData = await entryRes.json();
        const analyticsData = await analyticsRes.json();

        if (entryData.entries?.length > 0) {
          setTodayEntry(entryData.entries[0]);
        }

        setAnalytics(analyticsData);

        const allEntries: IEntry[] = analyticsData.entries || [];
        setRecentEntries(allEntries.slice(0, 5));
        setWeekData(buildWeekData(allEntries));
        setInsights(generateInsights(analyticsData));
        calculateStreak(entryData.entries || allEntries);
      } catch (error) {
        console.error("Failed to fetch overview data:", error);
        toast({ title: "Error", description: "Failed to load overview data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router, toast]);

  const calculateStreak = (entries: IEntry[]) => {
    if (!entries || entries.length === 0) { setStreak(0); return; }
    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const entry of sorted) {
      const d = new Date(entry.date);
      d.setHours(0, 0, 0, 0);
      if (Math.floor((today.getTime() - d.getTime()) / 86400000) === count) { count++; } else { break; }
    }
    setStreak(count);
  };

  const buildWeekData = (entries: IEntry[]): WeekDay[] => {
    const days: WeekDay[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const dateStr = d.toISOString().split("T")[0];
      const entry = entries.find(e => new Date(e.date).toISOString().split("T")[0] === dateStr);
      days.push({
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: dateStr, mood: entry?.mood ?? null, hasEntry: !!entry,
      });
    }
    return days;
  };

  const generateInsights = (data: AnalyticsData): Insight[] => {
    const result: Insight[] = [];
    const s = data?.summary;
    if (!s || s.entriesLogged === 0) return result;

    if (s.moodAverage >= 4) result.push({ icon: TrendingUp, text: `Great mood trend — 30-day average is ${s.moodAverage.toFixed(1)}/5.`, type: "positive" });
    else if (s.moodAverage < 3) result.push({ icon: TrendingDown, text: `Mood averaged ${s.moodAverage.toFixed(1)}/5. Consider relaxation exercises.`, type: "warning" });

    if (s.sleepAverage < 6) result.push({ icon: Moon, text: `Averaging ${s.sleepAverage.toFixed(1)}h sleep — below the recommended 7–9 hours.`, type: "warning" });
    else if (s.sleepAverage >= 7) result.push({ icon: Moon, text: `Solid sleep at ${s.sleepAverage.toFixed(1)}h avg.`, type: "positive" });

    if (s.stressAverage >= 7) result.push({ icon: Brain, text: `Stress elevated at ${s.stressAverage.toFixed(1)}/10. Try mindfulness breaks.`, type: "warning" });
    else if (s.stressAverage <= 4) result.push({ icon: Brain, text: `Stress well-managed at ${s.stressAverage.toFixed(1)}/10.`, type: "positive" });

    if (s.entriesLogged >= 20) result.push({ icon: Activity, text: `${s.entriesLogged} entries this month — excellent consistency.`, type: "positive" });
    else if (s.entriesLogged < 7) result.push({ icon: Activity, text: `Only ${s.entriesLogged} entries. Log more to see better patterns.`, type: "info" });

    return result.slice(0, 4);
  };

  const stats = [
    { label: "Avg Mood", value: analytics?.summary?.moodAverage ? parseFloat(analytics.summary.moodAverage.toString()).toFixed(1) : null, subtext: "Last 30 days", icon: Smile },
    { label: "Avg Sleep", value: analytics?.summary?.sleepAverage ? parseFloat(analytics.summary.sleepAverage.toString()).toFixed(1) + "h" : null, subtext: "Last 30 days", icon: Moon },
    { label: "Avg Stress", value: analytics?.summary?.stressAverage ? parseFloat(analytics.summary.stressAverage.toString()).toFixed(1) : null, subtext: "Last 30 days", icon: Brain },
    { label: "Entries", value: analytics?.summary?.entriesLogged ?? 0, subtext: "Last 30 days", icon: BookOpen },
  ];

  return (
    <div>
      <DashboardHeader title="Overview" description="Your mental wellness at a glance" />
      <div className="p-6 space-y-6">
        <QuickActionBar
          onLogEntry={() => router.push("/dashboard/journal")}
          onAskAssistant={() => router.push("/dashboard/assistant")}
          isLoading={isLoading}
        />

        <QuickStatsCards stats={stats} isLoading={isLoading} />

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

        {/* 7-Day Mood + Recent Entries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">7-Day Mood</CardTitle>
                <span className="text-xs text-muted-foreground">This week</span>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-end gap-2 h-20">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="flex-1 rounded bg-muted animate-pulse" style={{ height: "60%" }} />
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-end gap-1.5 h-20">
                    {weekData.map((day) => (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                        <div
                          className={`w-full rounded-sm transition-colors ${
                            day.hasEntry ? "bg-primary" : "bg-muted"
                          }`}
                          style={{
                            height: day.mood ? `${(day.mood / 5) * 100}%` : "4px",
                            minHeight: "4px",
                          }}
                          title={day.hasEntry ? `${day.label}: ${day.mood}/5` : `${day.label}: No entry`}
                        />
                        <span className="text-[10px] text-muted-foreground">{day.label.slice(0, 2)}</span>
                      </div>
                    ))}
                  </div>
                  {weekData.filter(d => d.hasEntry).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-3">No entries this week</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Recent Entries</CardTitle>
                <button
                  onClick={() => router.push("/dashboard/journal")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 rounded bg-muted animate-pulse" />
                  ))}
                </div>
              ) : recentEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No entries yet. Start logging!</p>
              ) : (
                <div className="space-y-2">
                  {recentEntries.slice(0, 4).map((entry) => (
                    <div
                      key={String(entry._id)}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Smile className="h-3 w-3" />{entry.mood}/5</span>
                        <span className="flex items-center gap-1"><Brain className="h-3 w-3" />{entry.stress}/10</span>
                        <span className="flex items-center gap-1"><Moon className="h-3 w-3" />{entry.sleep}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        {!isLoading && insights.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                Wellness Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-lg border p-3">
                    <insight.icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <p className="text-xs text-foreground leading-relaxed">{insight.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
