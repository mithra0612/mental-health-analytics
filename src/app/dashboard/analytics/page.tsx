"use client";

import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { TrendChart } from "@/components/dashboard/analytics/TrendChart";
import { PieChart, Pie, Cell, BarChart, Bar, Tooltip, Legend, ResponsiveContainer, XAxis } from "recharts";

export default function AnalyticsPage() {
  const sampleData = [
    { date: "2026-03-01", value: 3 },
    { date: "2026-03-02", value: 4 },
    { date: "2026-03-03", value: 5 },
    { date: "2026-03-04", value: 2 },
    { date: "2026-03-05", value: 3 },
    { date: "2026-03-06", value: 4 },
    { date: "2026-03-07", value: 5 },
  ];

  const emotionData = [
    { name: "Happy", value: 40 },
    { name: "Sad", value: 20 },
    { name: "Angry", value: 10 },
    { name: "Relaxed", value: 30 },
  ];

  const triggerData = [
    { name: "Work", count: 15 },
    { name: "Family", count: 10 },
    { name: "Health", count: 5 },
    { name: "Finance", count: 8 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div>
      <DashboardHeader
        title="Analytics"
        description="Advanced trends, patterns, and metrics"
      />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TrendChart
          title="Mood Trends"
          description="Daily mood scores over the past week"
          data={sampleData}
          color="#3b82f6"
          unit="/5"
        />
        <TrendChart
          title="Stress Levels"
          description="Daily stress levels over the past week"
          data={sampleData.map((d) => ({ ...d, value: d.value * 2 }))}
          color="#ef4444"
          unit="/10"
        />
        <TrendChart
          title="Sleep Patterns"
          description="Hours of sleep over the past week"
          data={sampleData.map((d) => ({ ...d, value: d.value + 4 }))}
          color="#10b981"
          unit="hours"
        />

        {/* Emotion Distribution */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-lg font-medium text-foreground mb-4">Emotion Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={emotionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {emotionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Trigger Analysis */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-lg font-medium text-foreground mb-4">Trigger Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={triggerData}>
              <Bar dataKey="count" fill="#82ca9d" />
              <XAxis dataKey="name" />
              <Tooltip />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Correlations */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-lg font-medium text-foreground mb-4">Correlations</h3>
          <p className="text-sm text-muted-foreground">
            Higher mood scores are strongly correlated with days involving outdoor activities and 7+ hours of sleep.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Stress levels tend to decrease on days with mindfulness practices logged.
          </p>
        </div>
      </div>
    </div>
  );
}
