"use client";

import {
  AreaChart,
  Area,
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

interface SleepChartProps {
  data: ChartData[];
}

export default function SleepChart({ data }: SleepChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const tooltipBg = isDark ? "#1e293b" : "white";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";

  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Sleep Hours</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="date"
                stroke={textColor}
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                domain={[0, 12]}
                stroke={textColor}
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  color: isDark ? "#f1f5f9" : "#1e293b",
                }}
                formatter={(value: number) => [`${value} hours`, "Sleep"]}
              />
              <Area
                type="monotone"
                dataKey="sleep"
                stroke="#6366f1"
                strokeWidth={3}
                fill="url(#sleepGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No sleep data yet. Start logging your daily entries!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
