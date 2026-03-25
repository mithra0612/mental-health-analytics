"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendChart } from "@/components/dashboard/analytics/TrendChart";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";
import { useToast } from "@/components/ui/use-toast";
import type { IEntry } from "@/types";

interface AnalyticsResponse {
  summary: {
    entriesLogged: number;
    moodAverage: number;
    sleepAverage: number;
    stressAverage: number;
  };
  period: string;
  entries: IEntry[];
}

const PERIODS = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/analytics?period=${period}`);
        if (res.status === 401) { router.push("/login"); return; }
        if (!res.ok) throw new Error("Failed to fetch analytics");
        setData(await res.json());
      } catch (error) {
        console.error("Analytics fetch error:", error);
        toast({ title: "Error", description: "Could not load analytics.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [router, toast, period]);

  const entries = data?.entries ? [...data.entries].reverse() : [];

  const trendData = entries.map(e => {
    const d = new Date(e.date);
    return { date: `${d.getMonth() + 1}/${d.getDate()}`, mood: e.mood, stress: e.stress, sleep: e.sleep };
  });

  const emotionCounts: Record<string, number> = {};
  const triggerCounts: Record<string, number> = {};
  entries.forEach(e => {
    e.emotions.forEach(em => { emotionCounts[em] = (emotionCounts[em] || 0) + 1; });
    e.triggers.forEach(tr => { triggerCounts[tr] = (triggerCounts[tr] || 0) + 1; });
  });

  const emotionData = Object.entries(emotionCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  const triggerData = Object.entries(triggerCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6);

  const PIE_COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--muted-foreground))",
    "hsl(220 14% 60%)",
    "hsl(220 14% 75%)",
    "hsl(220 14% 45%)",
    "hsl(220 14% 85%)",
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-lg border bg-background px-3 py-2 shadow-sm">
          <p className="text-sm font-medium">{payload[0].name || payload[0].payload?.name}</p>
          <p className="text-xs text-muted-foreground">{payload[0].value} occurrences</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <DashboardHeader
        title="Analytics"
        description="Trends, patterns, and metrics from your journal entries"
        actions={
          <div className="flex gap-1">
            {PERIODS.map(p => (
              <Button
                key={p.value}
                variant={period === p.value ? "default" : "outline"}
                size="sm"
                className="text-xs h-8"
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Summary Stats */}
        {data?.summary && !isLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Entries Logged", value: data.summary.entriesLogged },
              { label: "Mood Average", value: data.summary.moodAverage.toFixed(1) + "/5" },
              { label: "Sleep Average", value: data.summary.sleepAverage.toFixed(1) + "h" },
              { label: "Stress Average", value: data.summary.stressAverage.toFixed(1) + "/10" },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Trend Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TrendChart
            title="Mood Trend"
            description="Daily mood scores"
            data={trendData.map(d => ({ date: d.date, value: d.mood }))}
            color="hsl(var(--primary))"
            unit="/5"
            isLoading={isLoading}
          />
          <TrendChart
            title="Stress Levels"
            description="Daily stress readings"
            data={trendData.map(d => ({ date: d.date, value: d.stress }))}
            color="hsl(0 72% 51%)"
            unit="/10"
            isLoading={isLoading}
          />
          <TrendChart
            title="Sleep Duration"
            description="Hours of sleep per night"
            data={trendData.map(d => ({ date: d.date, value: d.sleep }))}
            color="hsl(142 71% 45%)"
            unit="h"
            isLoading={isLoading}
          />
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Emotion Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Emotion Distribution</CardTitle>
              <CardDescription>Most frequently logged emotions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[250px] w-full rounded bg-muted animate-pulse" />
              ) : emotionData.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">No emotions logged</p>
                </div>
              ) : (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={emotionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} stroke="none">
                        {emotionData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 -mt-2">
                    {emotionData.map((e, i) => (
                      <div key={e.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {e.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trigger Analysis */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Common Triggers</CardTitle>
              <CardDescription>Factors impacting your wellness</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[280px] w-full rounded bg-muted animate-pulse" />
              ) : triggerData.length === 0 ? (
                <div className="h-[280px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">No triggers logged</p>
                </div>
              ) : (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={triggerData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={70} className="fill-foreground" />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
