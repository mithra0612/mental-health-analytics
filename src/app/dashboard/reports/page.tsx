"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  Smile, Moon, Brain, Activity, Calendar, TrendingUp,
  TrendingDown, Download, FileText, BarChart3,
} from "lucide-react";
import type { IEntry } from "@/types";

interface ReportData {
  summary: {
    entriesLogged: number;
    moodAverage: number;
    sleepAverage: number;
    stressAverage: number;
  };
  entries: IEntry[];
}

function StatCard({ label, value, icon: Icon, description }: {
  label: string; value: string; icon: React.ElementType; description?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const [weeklyData, setWeeklyData] = useState<ReportData | null>(null);
  const [monthlyData, setMonthlyData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weeklyRes, monthlyRes] = await Promise.all([
          fetch("/api/analytics?period=7d"),
          fetch("/api/analytics?period=30d"),
        ]);

        if (weeklyRes.status === 401 || monthlyRes.status === 401) {
          router.push("/login");
          return;
        }

        setWeeklyData(await weeklyRes.json());
        setMonthlyData(await monthlyRes.json());
      } catch (error) {
        console.error("Reports fetch error:", error);
        toast({ title: "Error", description: "Could not load reports.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router, toast]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindtrack-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export complete", description: "Your data has been downloaded." });
    } catch {
      toast({ title: "Error", description: "Failed to export data.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const renderReport = (data: ReportData | null, periodLabel: string) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}><CardContent className="p-4"><div className="h-16 rounded bg-muted animate-pulse" /></CardContent></Card>
            ))}
          </div>
          <Card><CardContent className="p-4"><div className="h-40 rounded bg-muted animate-pulse" /></CardContent></Card>
        </div>
      );
    }

    if (!data || data.summary.entriesLogged === 0) {
      return (
        <Card>
          <CardContent className="p-12 flex flex-col items-center text-center">
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="font-medium text-muted-foreground">No data for this period</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Start logging entries to generate reports.</p>
          </CardContent>
        </Card>
      );
    }

    const { summary, entries } = data;

    // Find best and worst days
    const sortedByMood = [...entries].sort((a, b) => b.mood - a.mood);
    const bestDay = sortedByMood[0];
    const worstDay = sortedByMood[sortedByMood.length - 1];

    // Sleep analysis
    const sortedBySleep = [...entries].sort((a, b) => b.sleep - a.sleep);
    const bestSleep = sortedBySleep[0];
    const worstSleep = sortedBySleep[sortedBySleep.length - 1];

    // Emotion frequency
    const emotionCounts: Record<string, number> = {};
    entries.forEach(e => e.emotions.forEach(em => { emotionCounts[em] = (emotionCounts[em] || 0) + 1; }));
    const topEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Trigger frequency
    const triggerCounts: Record<string, number> = {};
    entries.forEach(e => e.triggers.forEach(tr => { triggerCounts[tr] = (triggerCounts[tr] || 0) + 1; }));
    const topTriggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const formatDate = (d: Date | string) =>
      new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    return (
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Entries Logged" value={String(summary.entriesLogged)} icon={Activity} description={periodLabel} />
          <StatCard label="Mood Average" value={summary.moodAverage.toFixed(1) + "/5"} icon={Smile} />
          <StatCard label="Sleep Average" value={summary.sleepAverage.toFixed(1) + "h"} icon={Moon} />
          <StatCard label="Stress Average" value={summary.stressAverage.toFixed(1) + "/10"} icon={Brain} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Best & Worst Days */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Mood Highlights</CardTitle>
              <CardDescription>Best and lowest mood days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {bestDay && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>Best day</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{bestDay.mood}/5</p>
                    <p className="text-xs text-muted-foreground">{formatDate(bestDay.date)}</p>
                  </div>
                </div>
              )}
              {worstDay && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    <span>Lowest day</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{worstDay.mood}/5</p>
                    <p className="text-xs text-muted-foreground">{formatDate(worstDay.date)}</p>
                  </div>
                </div>
              )}
              {bestSleep && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Moon className="h-4 w-4 text-muted-foreground" />
                    <span>Best sleep</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{bestSleep.sleep}h</p>
                    <p className="text-xs text-muted-foreground">{formatDate(bestSleep.date)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consistency */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Logging Consistency</CardTitle>
              <CardDescription>How regularly you tracked</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Coverage</span>
                  <span className="font-medium">
                    {summary.entriesLogged}/{periodLabel === "Last 7 days" ? 7 : 30} days
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min((summary.entriesLogged / (periodLabel === "Last 7 days" ? 7 : 30)) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  {summary.entriesLogged >= (periodLabel === "Last 7 days" ? 5 : 20)
                    ? "Great consistency! Regular tracking helps reveal meaningful patterns."
                    : "Try logging more often for better insights and trend analysis."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emotion & Trigger tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Top Emotions</CardTitle>
              <CardDescription>Most frequently logged feelings</CardDescription>
            </CardHeader>
            <CardContent>
              {topEmotions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No emotions logged</p>
              ) : (
                <div className="space-y-2">
                  {topEmotions.map(([emotion, count]) => (
                    <div key={emotion} className="flex items-center justify-between text-sm">
                      <span>{emotion}</span>
                      <span className="text-muted-foreground tabular-nums">{count}×</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Top Triggers</CardTitle>
              <CardDescription>Main factors affecting wellness</CardDescription>
            </CardHeader>
            <CardContent>
              {topTriggers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No triggers logged</p>
              ) : (
                <div className="space-y-2">
                  {topTriggers.map(([trigger, count]) => (
                    <div key={trigger} className="flex items-center justify-between text-sm">
                      <span>{trigger}</span>
                      <span className="text-muted-foreground tabular-nums">{count}×</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div>
      <DashboardHeader
        title="Reports"
        description="Weekly and monthly wellness summaries"
        actions={
          <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={handleExport} disabled={isExporting}>
            <Download className="h-3.5 w-3.5" />
            {isExporting ? "Exporting..." : "Export Data"}
          </Button>
        }
      />
      <div className="p-6">
        <Tabs defaultValue="weekly" className="space-y-6">
          <TabsList>
            <TabsTrigger value="weekly" className="gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Monthly
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            {renderReport(weeklyData, "Last 7 days")}
          </TabsContent>

          <TabsContent value="monthly">
            {renderReport(monthlyData, "Last 30 days")}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
