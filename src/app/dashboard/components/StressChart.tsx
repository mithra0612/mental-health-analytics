"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";

interface ChartData {
  date: string;
  mood: number;
  sleep: number;
  stress: number;
}

interface StressChartProps {
  data: ChartData[];
}

export default function StressChart({ data }: StressChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const tooltipBg = isDark ? "#1e293b" : "white";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";

  const getBarColor = (stress: number) => {
    if (stress <= 3) return "#22c55e";
    if (stress <= 5) return "#eab308";
    if (stress <= 7) return "#f97316";
    return "#ef4444";
  };

  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Stress Levels</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="date"
                stroke={textColor}
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                stroke={textColor}
                fontSize={12}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  color: isDark ? "#f1f5f9" : "#1e293b",
                }}
                formatter={(value: number) => [`${value}/10`, "Stress"]}
              />
              <Bar dataKey="stress" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.stress)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No stress data yet. Start logging your daily entries!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
