"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Smile,
  Brain,
  Moon,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart2,
  Activity,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Entry {
  _id: string;
  date: string;
  mood: number;
  stress: number;
  sleep: number;
  emotions: string[];
  triggers: string[];
  notes?: string;
}

interface AnalyticsResponse {
  summary: {
    entriesLogged: number;
    moodAverage: number;
    sleepAverage: number;
    stressAverage: number;
  };
  entries: Entry[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PALETTE = [
  "#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#84cc16",
];

const CustomTooltipStyle = {
  backgroundColor: "rgba(15,23,42,0.92)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  color: "#f1f5f9",
  fontSize: "13px",
  padding: "10px 14px",
};

const fmt = (d: string) => {
  const date = new Date(d);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

function trendIcon(current: number, previous: number, lowerIsBetter = false) {
  const diff = current - previous;
  const improved = lowerIsBetter ? diff < -0.1 : diff > 0.1;
  const worsened = lowerIsBetter ? diff > 0.1 : diff < -0.1;
  if (improved) return { icon: TrendingUp, color: "text-emerald-500", label: `+${Math.abs(diff).toFixed(1)}` };
  if (worsened) return { icon: TrendingDown, color: "text-red-500", label: `-${Math.abs(diff).toFixed(1)}` };
  return { icon: Minus, color: "text-muted-foreground", label: "Stable" };
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?period=${period}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  // ── Derived data ────────────────────────────────────────────────────────

  const timeSeriesData = useMemo(() => {
    if (!data) return [];
    return [...data.entries]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((e) => ({ date: fmt(e.date), mood: e.mood, stress: e.stress, sleep: e.sleep }));
  }, [data]);

  const dayOfWeekData = useMemo(() => {
    if (!data) return [];
    const buckets = DAY_LABELS.map((day) => ({
      day,
      mood: [] as number[],
      stress: [] as number[],
      sleep: [] as number[],
    }));
    data.entries.forEach((e) => {
      const d = new Date(e.date).getDay();
      buckets[d].mood.push(e.mood);
      buckets[d].stress.push(e.stress);
      buckets[d].sleep.push(e.sleep);
    });
    return buckets.map((b) => ({
      day: b.day,
      mood: b.mood.length ? parseFloat((b.mood.reduce((a, v) => a + v, 0) / b.mood.length).toFixed(1)) : 0,
      stress: b.stress.length ? parseFloat((b.stress.reduce((a, v) => a + v, 0) / b.stress.length).toFixed(1)) : 0,
      sleep: b.sleep.length ? parseFloat((b.sleep.reduce((a, v) => a + v, 0) / b.sleep.length).toFixed(1)) : 0,
    }));
  }, [data]);

  const emotionData = useMemo(() => {
    if (!data) return [];
    const counts: Record<string, number> = {};
    data.entries.forEach((e) => e.emotions?.forEach((em) => { counts[em] = (counts[em] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
  }, [data]);

  const triggerData = useMemo(() => {
    if (!data) return [];
    const counts: Record<string, number> = {};
    data.entries.forEach((e) => e.triggers?.forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));
  }, [data]);

  const scatterData = useMemo(() => {
    if (!data) return [];
    return data.entries.map((e) => ({ sleep: e.sleep, mood: e.mood, stress: e.stress }));
  }, [data]);

  const weeklyData = useMemo(() => {
    if (!data) return [];
    const weeks: Record<string, { mood: number[]; stress: number[]; sleep: number[] }> = {};
    data.entries.forEach((e) => {
      const d = new Date(e.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      if (!weeks[key]) weeks[key] = { mood: [], stress: [], sleep: [] };
      weeks[key].mood.push(e.mood);
      weeks[key].stress.push(e.stress);
      weeks[key].sleep.push(e.sleep);
    });
    return Object.entries(weeks).slice(-8).map(([week, v]) => ({
      week: `W ${week}`,
      mood: parseFloat((v.mood.reduce((a, b) => a + b, 0) / v.mood.length).toFixed(1)),
      stress: parseFloat((v.stress.reduce((a, b) => a + b, 0) / v.stress.length).toFixed(1)),
      sleep: parseFloat((v.sleep.reduce((a, b) => a + b, 0) / v.sleep.length).toFixed(1)),
    }));
  }, [data]);

  // ── Trend arrows (first half vs second half) ─────────────────────────────
  const halfLen = Math.ceil((data?.entries.length ?? 0) / 2);
  const firstHalf = data?.entries.slice(halfLen) ?? [];
  const secondHalf = data?.entries.slice(0, halfLen) ?? [];
  const avg = (arr: Entry[], key: keyof Entry) =>
    arr.length ? arr.reduce((s, e) => s + (e[key] as number), 0) / arr.length : 0;

  const moodTrend = trendIcon(avg(secondHalf, "mood"), avg(firstHalf, "mood"));
  const stressTrend = trendIcon(avg(secondHalf, "stress"), avg(firstHalf, "stress"), true);
  const sleepTrend = trendIcon(avg(secondHalf, "sleep"), avg(firstHalf, "sleep"));

  const summaryCards = [
    {
      label: "Avg Mood",
      value: data?.summary.moodAverage ?? 0,
      suffix: "/5",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      icon: Smile,
      trend: moodTrend,
    },
    {
      label: "Avg Stress",
      value: data?.summary.stressAverage ?? 0,
      suffix: "/10",
      color: "text-red-500",
      bg: "bg-red-500/10",
      icon: Brain,
      trend: stressTrend,
    },
    {
      label: "Avg Sleep",
      value: data?.summary.sleepAverage ?? 0,
      suffix: " hrs",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      icon: Moon,
      trend: sleepTrend,
    },
    {
      label: "Entries Logged",
      value: data?.summary.entriesLogged ?? 0,
      suffix: "",
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      icon: BarChart2,
      trend: null,
      description: `in last ${period === "7d" ? "7" : period === "30d" ? "30" : "90"} days`,
    },
  ];

  return (
    <div>
      <DashboardHeader
        title="Analytics"
        description="Advanced trends, patterns, and correlations from your journal data"
      />

      <div className="p-6 space-y-6">
        {/* Period Selector */}
        <div className="flex items-center gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                period === opt.value
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <Card key={card.label} className="relative overflow-hidden">
              <CardContent className="p-5">
                {loading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        {card.label}
                      </span>
                      <div className={`p-1.5 rounded-lg ${card.bg}`}>
                        <card.icon className={`h-4 w-4 ${card.color}`} />
                      </div>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className={`text-3xl font-bold ${card.color}`}>
                        {typeof card.value === "number" ? card.value.toFixed(1) : card.value}
                      </span>
                      <span className="text-sm text-muted-foreground mb-1">{card.suffix}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {card.trend ? (
                        <>
                          <card.trend.icon className={`h-3.5 w-3.5 ${card.trend.color}`} />
                          <span className={card.trend.color}>{card.trend.label}</span>
                          <span className="text-muted-foreground">vs prior half</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">{(card as { description?: string }).description}</span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mood + Stress Combined Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Mood & Stress Over Time
            </CardTitle>
            <CardDescription>
              Daily mood score vs stress level — spot the impact of stressors on wellbeing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={Math.max(1, Math.floor(timeSeriesData.length / 8))} />
                  <YAxis yAxisId="mood" domain={[0, 5]} tick={{ fontSize: 11 }} width={28} />
                  <YAxis yAxisId="stress" orientation="right" domain={[0, 10]} tick={{ fontSize: 11 }} width={30} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Legend />
                  <Area yAxisId="mood" type="monotone" dataKey="mood" fill="url(#moodGrad)" stroke="#3b82f6" strokeWidth={2} dot={false} name="Mood /5" />
                  <Line yAxisId="stress" type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} dot={false} name="Stress /10" />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Sleep Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Moon className="h-4 w-4 text-emerald-500" />
              Sleep Duration
            </CardTitle>
            <CardDescription>Nightly sleep hours — aim for 7–9 hours for optimal wellbeing</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={Math.max(1, Math.floor(timeSeriesData.length / 8))} />
                  <YAxis domain={[4, 12]} tick={{ fontSize: 11 }} width={28} />
                  <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: number) => [`${v}h`, "Sleep"]} />
                  <ReferenceLine y={7} stroke="#10b981" strokeDasharray="4 4" label={{ value: "Min 7h", fontSize: 11, fill: "#10b981", position: "right" }} />
                  <ReferenceLine y={9} stroke="#6366f1" strokeDasharray="4 4" label={{ value: "Max 9h", fontSize: 11, fill: "#6366f1", position: "right" }} />
                  <Area type="monotone" dataKey="sleep" fill="url(#sleepGrad)" stroke="#10b981" strokeWidth={2} dot={false} name="Sleep hrs" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Weekly Bars + Day-of-Week Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Averages</CardTitle>
              <CardDescription>Mood, stress, and sleep grouped by calendar week</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={weeklyData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} width={28} />
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Legend />
                    <Bar dataKey="mood" name="Mood /5" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="stress" name="Stress /10" fill="#ef4444" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="sleep" name="Sleep hrs" fill="#10b981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Day-of-Week Patterns</CardTitle>
              <CardDescription>Which days of the week feel best and most stressful?</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={dayOfWeekData}>
                    <PolarGrid stroke="rgba(128,128,128,0.2)" />
                    <PolarAngleAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10 }} />
                    <Radar name="Mood ×2" dataKey={(d: { mood: number }) => d.mood * 2} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                    <Radar name="Stress" dataKey="stress" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                    <Radar name="Sleep" dataKey="sleep" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    <Legend />
                    <Tooltip contentStyle={CustomTooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Emotion Donut + Trigger Horizontal Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Emotion Distribution</CardTitle>
              <CardDescription>Frequency of emotions logged across all entries</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="flex flex-col gap-3">
                  <ResponsiveContainer width="100%" height={210}>
                    <PieChart>
                      <Pie
                        data={emotionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {emotionData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={CustomTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {emotionData.map((e, i) => (
                      <span key={e.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                        {e.name} ({e.value})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Triggers</CardTitle>
              <CardDescription>Most frequently logged triggers affecting your mental state</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={triggerData} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Bar dataKey="count" name="Occurrences" radius={[0, 4, 4, 0]}>
                      {triggerData.map((_, index) => (
                        <Cell key={`trigger-${index}`} fill={PALETTE[index % PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sleep vs Mood Scatter */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-base">Sleep vs Mood Correlation</CardTitle>
            <CardDescription>
              Does more sleep lead to better mood? Each dot represents one journal entry.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                  <XAxis
                    dataKey="sleep"
                    name="Sleep"
                    type="number"
                    domain={[4, 12]}
                    tick={{ fontSize: 11 }}
                    label={{ value: "Sleep (hrs)", position: "insideBottom", offset: -10, fontSize: 12 }}
                  />
                  <YAxis
                    dataKey="mood"
                    name="Mood"
                    type="number"
                    domain={[1, 5]}
                    tick={{ fontSize: 11 }}
                    label={{ value: "Mood /5", angle: -90, position: "insideLeft", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={CustomTooltipStyle}
                    content={({ payload }) => {
                      if (!payload?.length) return null;
                      const d = payload[0].payload as { sleep: number; mood: number; stress: number };
                      return (
                        <div style={CustomTooltipStyle}>
                          <div>Sleep: <strong>{d.sleep}h</strong></div>
                          <div>Mood: <strong>{d.mood}/5</strong></div>
                          <div>Stress: <strong>{d.stress}/10</strong></div>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={scatterData} fill="#6366f1" fillOpacity={0.55} />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
