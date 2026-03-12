"use client";

import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Smile, Moon, Brain, Activity, TrendingUp, TrendingDown, Minus,
  Zap, Target, Award, AlertCircle, CheckCircle2, Lightbulb, Heart, Wind,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Entry {
  date: string;
  mood: number;
  stress: number;
  sleep: number;
  emotions: string[];
  triggers: string[];
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function avgArr(arr: number[]) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function pct(value: number, max: number) {
  return Math.round((value / max) * 100);
}

function healthScore(moodAvg: number, stressAvg: number, sleepAvg: number, consistency: number): number {
  const moodScore = (moodAvg / 5) * 35;
  const stressScore = ((10 - stressAvg) / 10) * 30;
  const sleepScore = (Math.min(sleepAvg, 9) / 9) * 25;
  const consistencyScore = Math.min(consistency, 1) * 10;
  return Math.round(moodScore + stressScore + sleepScore + consistencyScore);
}

function scoreColor(score: number) {
  if (score >= 75) return { text: "text-emerald-500", label: "Excellent" };
  if (score >= 55) return { text: "text-blue-500", label: "Good" };
  if (score >= 35) return { text: "text-amber-500", label: "Fair" };
  return { text: "text-red-500", label: "Needs Attention" };
}

interface TrendMeta { icon: React.ElementType; color: string; label: string; diff: number; }

function calcTrend(curr: number, prev: number, lowerIsBetter = false): TrendMeta {
  const diff = curr - prev;
  const improved = lowerIsBetter ? diff < -0.1 : diff > 0.1;
  const worsened = lowerIsBetter ? diff > 0.1 : diff < -0.1;
  if (improved) return { icon: TrendingUp, color: "text-emerald-500", label: "Improving", diff };
  if (worsened) return { icon: TrendingDown, color: "text-red-500", label: "Declining", diff };
  return { icon: Minus, color: "text-muted-foreground", label: "Stable", diff };
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InsightsPage() {
  const [data30, setData30] = useState<AnalyticsResponse | null>(null);
  const [data7, setData7] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics?period=30d").then((r) => r.json()),
      fetch("/api/analytics?period=7d").then((r) => r.json()),
    ])
      .then(([d30, d7]) => { setData30(d30); setData7(d7); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const entries30 = useMemo(() => data30?.entries ?? [], [data30]);
  const entries7 = useMemo(() => data7?.entries ?? [], [data7]);

  const half = Math.ceil(entries30.length / 2);
  const prevHalf = entries30.slice(half);
  const currHalf = entries30.slice(0, half);

  const currMood = avgArr(currHalf.map((e) => e.mood));
  const prevMood = avgArr(prevHalf.map((e) => e.mood));
  const currStress = avgArr(currHalf.map((e) => e.stress));
  const prevStress = avgArr(prevHalf.map((e) => e.stress));

  const stressTrend = calcTrend(currStress, prevStress, true);
  const moodTrend = calcTrend(currMood, prevMood);

  const summary30 = data30?.summary;
  const consistencyRate = entries30.length / 30;
  const score = summary30
    ? healthScore(summary30.moodAverage, summary30.stressAverage, summary30.sleepAverage, consistencyRate)
    : 0;
  const scoreStyle = scoreColor(score);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOfWeekData = useMemo(() => {
    const buckets = dayLabels.map((day) => ({ day, mood: [] as number[], stress: [] as number[] }));
    entries30.forEach((e) => {
      const d = new Date(e.date).getDay();
      buckets[d].mood.push(e.mood);
      buckets[d].stress.push(e.stress);
    });
    return buckets.map((b) => ({
      day: b.day,
      mood: b.mood.length ? parseFloat(avgArr(b.mood).toFixed(1)) : 0,
      stress: b.stress.length ? parseFloat(avgArr(b.stress).toFixed(1)) : 0,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries30]);

  const sparklineData = useMemo(() =>
    [...entries30]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14)
      .map((e) => ({ date: fmt(e.date), mood: e.mood, stress: e.stress, sleep: e.sleep })),
    [entries30]);

  const lastWeek = entries30.filter((e) => {
    const diff = (new Date().getTime() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 7 && diff < 14;
  });
  const weekComparison = [
    { metric: "Mood /5", thisWeek: parseFloat(avgArr(entries7.map((e) => e.mood)).toFixed(1)), lastWeek: parseFloat(avgArr(lastWeek.map((e) => e.mood)).toFixed(1)), max: 5, color: "#3b82f6" },
    { metric: "Sleep hrs", thisWeek: parseFloat(avgArr(entries7.map((e) => e.sleep)).toFixed(1)), lastWeek: parseFloat(avgArr(lastWeek.map((e) => e.sleep)).toFixed(1)), max: 10, color: "#10b981" },
    { metric: "Stress /10", thisWeek: parseFloat(avgArr(entries7.map((e) => e.stress)).toFixed(1)), lastWeek: parseFloat(avgArr(lastWeek.map((e) => e.stress)).toFixed(1)), max: 10, color: "#ef4444" },
  ];

  const radarData = summary30 ? [
    { dim: "Mood", score: pct(summary30.moodAverage, 5) },
    { dim: "Sleep", score: pct(Math.min(summary30.sleepAverage, 9), 9) },
    { dim: "Low Stress", score: pct(10 - summary30.stressAverage, 10) },
    { dim: "Consistency", score: Math.min(100, Math.round(consistencyRate * 100)) },
    { dim: "Balance", score: Math.round(score * 0.9) },
  ] : [];

  const topEmotions = useMemo(() => {
    const counts: Record<string, number> = {};
    entries30.forEach((e) => e.emotions?.forEach((em) => { counts[em] = (counts[em] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [entries30]);

  const insights = useMemo(() => {
    if (!summary30) return [];
    type Severity = "positive" | "warning" | "neutral";
    const cards: { icon: React.ElementType; color: string; bg: string; title: string; description: string; severity: Severity }[] = [];

    if (currMood >= 4) {
      cards.push({ icon: Smile, color: "text-blue-500", bg: "bg-blue-500/10", title: "Strong Mood", description: `Your mood averaged ${currMood.toFixed(1)}/5 recently. Keep nurturing the habits driving this!`, severity: "positive" });
    } else if (currMood < 3) {
      cards.push({ icon: Smile, color: "text-red-400", bg: "bg-red-500/10", title: "Mood Needs Attention", description: `Mood averaging ${currMood.toFixed(1)}/5. Consider journaling about what is affecting you and reaching out to trusted people.`, severity: "warning" });
    } else {
      cards.push({ icon: Smile, color: "text-amber-500", bg: "bg-amber-500/10", title: "Steady Mood", description: `Mood at ${currMood.toFixed(1)}/5. Small wins like exercise and social connection can push this higher.`, severity: "neutral" });
    }

    if (summary30.sleepAverage >= 7 && summary30.sleepAverage <= 9) {
      cards.push({ icon: Moon, color: "text-emerald-500", bg: "bg-emerald-500/10", title: "Healthy Sleep Duration", description: `Averaging ${summary30.sleepAverage.toFixed(1)} hrs/night, right in the 7-9 hour optimal window. This positively correlates with your mood.`, severity: "positive" });
    } else if (summary30.sleepAverage < 6) {
      cards.push({ icon: Moon, color: "text-red-400", bg: "bg-red-500/10", title: "Sleep Deficit Detected", description: `Only ${summary30.sleepAverage.toFixed(1)} hrs/night. Chronic under-sleep raises stress and lowers mood. Try a consistent bedtime.`, severity: "warning" });
    } else {
      cards.push({ icon: Moon, color: "text-amber-500", bg: "bg-amber-500/10", title: "Sleep Below Target", description: `Averaging ${summary30.sleepAverage.toFixed(1)} hrs, slightly short of 7+. An extra 30 minutes could improve focus and mood.`, severity: "neutral" });
    }

    if (currStress <= 4) {
      cards.push({ icon: Wind, color: "text-emerald-500", bg: "bg-emerald-500/10", title: "Low Stress Levels", description: `Stress averaging ${currStress.toFixed(1)}/10 recently. Your coping strategies appear to be working well.`, severity: "positive" });
    } else if (currStress >= 7) {
      cards.push({ icon: Brain, color: "text-red-400", bg: "bg-red-500/10", title: "High Stress Flagged", description: `Stress at ${currStress.toFixed(1)}/10. Mindfulness, physical activity, or short breaks can help regulate this.`, severity: "warning" });
    } else {
      cards.push({ icon: Brain, color: "text-amber-500", bg: "bg-amber-500/10", title: "Moderate Stress", description: `Stress at ${currStress.toFixed(1)}/10. Worth identifying top triggers and addressing them proactively.`, severity: "neutral" });
    }

    if (stressTrend.label === "Improving") {
      cards.push({ icon: TrendingDown, color: "text-emerald-500", bg: "bg-emerald-500/10", title: "Stress Trending Down", description: `Stress decreased ${Math.abs(stressTrend.diff).toFixed(1)} pts in the second half of the past 30 days. Great progress!`, severity: "positive" });
    } else if (stressTrend.label === "Declining") {
      cards.push({ icon: TrendingUp, color: "text-red-400", bg: "bg-red-500/10", title: "Stress Trending Up", description: `Stress rose ${Math.abs(stressTrend.diff).toFixed(1)} pts over the past 30 days. Schedule intentional recovery time.`, severity: "warning" });
    }

    if (moodTrend.label === "Improving") {
      cards.push({ icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", title: "Mood on the Rise", description: `Mood improved ${Math.abs(moodTrend.diff).toFixed(1)} pts in the second half of this month. Keep building on what is working.`, severity: "positive" });
    }

    if (entries30.length >= 25) {
      cards.push({ icon: Award, color: "text-violet-500", bg: "bg-violet-500/10", title: "Exceptional Consistency", description: `You logged ${entries30.length}/30 days this month. This consistency makes your insights far more accurate.`, severity: "positive" });
    } else if (entries30.length < 15) {
      cards.push({ icon: Target, color: "text-amber-500", bg: "bg-amber-500/10", title: "Build the Habit", description: `${entries30.length} entries this month. Daily check-ins improve insight accuracy greatly. Try logging after dinner.`, severity: "neutral" });
    }

    const best = [...entries30].sort((a, b) => b.mood - a.mood)[0];
    if (best) {
      cards.push({ icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10", title: "Best Recent Day", description: `Your best mood entry (${best.mood}/5) was on ${new Date(best.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}. Notice what made it different.`, severity: "positive" });
    }

    return cards;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary30, currMood, currStress, stressTrend, moodTrend, entries30]);

  const recommendations = [
    { icon: Lightbulb, text: "Log your mood immediately after waking for the most accurate baseline reading.", tag: "Tracking" },
    { icon: Moon, text: "Keep sleep and wake times consistent, even on weekends, to stabilise your circadian rhythm.", tag: "Sleep" },
    { icon: Wind, text: "When stress spikes, try box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s.", tag: "Stress" },
    { icon: Activity, text: "Even a 15-minute walk correlates with measurably better mood scores in the data.", tag: "Exercise" },
    { icon: Heart, text: "Review your best days and identify what made them different, then replicate those conditions.", tag: "Habits" },
  ];

  const severityBorder = { positive: "border-emerald-500/30", warning: "border-red-500/30", neutral: "border-amber-500/30" };
  const scoreGradient = score >= 75 ? "#10b981" : score >= 55 ? "#3b82f6" : score >= 35 ? "#f59e0b" : "#ef4444";

  return (
    <div>
      <DashboardHeader
        title="Insights"
        description="AI-powered patterns, trends, and personalised recommendations"
      />

      <div className="p-6 space-y-6">
        {/* Hero: Health Score + Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Wellbeing Score</CardTitle>
              <CardDescription>Composite of mood, sleep, stress and consistency</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pb-6">
              {loading ? <Skeleton className="h-32 w-32 rounded-full" /> : (
                <>
                  <div className="relative flex items-center justify-center w-36 h-36">
                    <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke={scoreGradient} strokeWidth="3"
                        strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round" className="transition-all duration-700" />
                    </svg>
                    <div className="absolute text-center">
                      <div className={`text-4xl font-bold ${scoreStyle.text}`}>{score}</div>
                      <div className="text-xs text-muted-foreground">/100</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${scoreStyle.text}`} style={{ borderColor: scoreGradient + "55" }}>
                    {scoreStyle.label}
                  </span>
                  <div className="w-full space-y-2 text-sm">
                    {[
                      { label: "Mood", value: summary30 ? pct(summary30.moodAverage, 5) : 0, color: "bg-blue-500" },
                      { label: "Sleep", value: summary30 ? pct(Math.min(summary30.sleepAverage, 9), 9) : 0, color: "bg-emerald-500" },
                      { label: "Low Stress", value: summary30 ? pct(10 - summary30.stressAverage, 10) : 0, color: "bg-red-400" },
                      { label: "Consistency", value: Math.min(100, Math.round(consistencyRate * 100)), color: "bg-violet-500" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <span className="w-20 text-xs text-muted-foreground">{item.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                        </div>
                        <span className="w-8 text-right text-xs text-muted-foreground">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Wellbeing Dimensions</CardTitle>
              <CardDescription>30-day performance across key mental health pillars</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-64 w-full" /> : (
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(128,128,128,0.2)" />
                    <PolarAngleAxis dataKey="dim" tick={{ fontSize: 13 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickCount={4} />
                    <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                    <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: number) => [`${v}%`, "Score"]} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 14-day Trend Sparklines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">14-Day Trend</CardTitle>
            <CardDescription>Recent daily mood, stress, and sleep trajectory</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-52 w-full" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient id="mG2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="slG2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" domain={[0, 10]} tick={{ fontSize: 11 }} width={24} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tick={{ fontSize: 11 }} width={24} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="mood" stroke="#3b82f6" fill="url(#mG2)" strokeWidth={2} dot={false} name="Mood" />
                  <Area yAxisId="left" type="monotone" dataKey="stress" stroke="#ef4444" fill="none" strokeWidth={2} dot={false} name="Stress" />
                  <Area yAxisId="right" type="monotone" dataKey="sleep" stroke="#10b981" fill="url(#slG2)" strokeWidth={2} dot={false} name="Sleep hrs" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Week-over-Week */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Week vs Last Week</CardTitle>
            <CardDescription>How your key metrics shifted in the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-48 w-full" /> : (
              <div className="space-y-4">
                {weekComparison.map((m) => {
                  const diff = m.thisWeek - m.lastWeek;
                  const lowerIsBetter = m.metric.includes("Stress");
                  const improved = lowerIsBetter ? diff < -0.1 : diff > 0.1;
                  const worsened = lowerIsBetter ? diff > 0.1 : diff < -0.1;
                  const TIcon = improved ? TrendingUp : worsened ? TrendingDown : Minus;
                  const tColor = improved ? "text-emerald-500" : worsened ? "text-red-500" : "text-muted-foreground";
                  return (
                    <div key={m.metric} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{m.metric}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground text-xs">Last: {m.lastWeek}</span>
                          <span className="text-foreground font-semibold">This: {m.thisWeek}</span>
                          <TIcon className={`h-4 w-4 ${tColor}`} />
                          <span className={`text-xs font-medium ${tColor}`}>{diff > 0 ? "+" : ""}{diff.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
                        <div className="absolute h-full rounded-full opacity-40" style={{ width: `${(m.lastWeek / m.max) * 100}%`, backgroundColor: m.color }} />
                        <div className="absolute h-full rounded-full" style={{ width: `${(m.thisWeek / m.max) * 100}%`, backgroundColor: m.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Day of Week */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mood and Stress by Day of Week</CardTitle>
            <CardDescription>Identify which days are consistently harder or easier</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-52 w-full" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dayOfWeekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} width={24} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Legend />
                  <Bar dataKey="mood" name="Mood /5" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="stress" name="Stress /10" fill="#ef4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Insight Cards */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Personalised Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
              : insights.map((ins, i) => (
                  <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-shadow ${severityBorder[ins.severity]}`}>
                    <div className={`p-2 rounded-lg ${ins.bg} flex-shrink-0`}>
                      <ins.icon className={`h-5 w-5 ${ins.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground">{ins.title}</h3>
                        {ins.severity === "positive" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                        {ins.severity === "warning" && <AlertCircle className="h-3.5 w-3.5 text-red-400" />}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{ins.description}</p>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* Top Emotions */}
        {!loading && topEmotions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Emotions This Month</CardTitle>
              <CardDescription>Your most frequently experienced emotional states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {topEmotions.map(([emotion, count], i) => {
                  const maxCount = topEmotions[0][1];
                  const colors = ["bg-blue-500", "bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
                  return (
                    <div key={emotion} className="flex items-center gap-3">
                      <span className="w-24 text-sm text-foreground font-medium">{emotion}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${colors[i]}`} style={{ width: `${(count / maxCount) * 100}%` }} />
                      </div>
                      <span className="w-6 text-right text-xs text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors">
                <div className="p-1.5 rounded-lg bg-amber-500/10 flex-shrink-0">
                  <rec.icon className="h-4 w-4 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1">{rec.tag}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rec.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
