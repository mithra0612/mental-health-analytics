"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";

interface ChartData {
  date: string;
  mood: number;
  sleep: number;
  stress: number;
}

interface MoodChartProps {
  data: ChartData[];
}

export default function MoodChart({ data }: MoodChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  const moodLabels = ["", "Very Bad", "Bad", "Neutral", "Good", "Very Good"];

  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const tooltipBg = isDark ? "#1e293b" : "white";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";

  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Mood Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="date"
                stroke={textColor}
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(value) => moodLabels[value] || ""}
                stroke={textColor}
                fontSize={10}
                tickLine={false}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  color: isDark ? "#f1f5f9" : "#1e293b",
                }}
                formatter={(value: number) => [moodLabels[value], "Mood"]}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#1d4ed8" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No mood data yet. Start logging your daily entries!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
