"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TrendChartProps {
  title: string;
  description?: string;
  data: Array<{ date: string; value: number }>;
  isLoading?: boolean;
  color?: string;
  unit?: string;
}

export function TrendChart({
  title,
  description,
  data,
  isLoading,
  color = "#3b82f6",
  unit,
}: TrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis
                dataKey="date"
                stroke="rgba(0,0,0,0.5)"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="rgba(0,0,0,0.5)"
                tick={{ fontSize: 12 }}
                label={unit ? { value: unit, angle: -90, position: "insideLeft" } : undefined}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.7)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: number) =>
                  unit ? [`${value.toFixed(1)}${unit}`, ""] : [value.toFixed(1), ""]
                }
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
