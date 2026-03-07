"use client";

import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InsightsPanelProps {
  insights: string[];
}

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardHeader className="flex flex-row items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <CardTitle className="text-lg font-semibold">Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length > 0 ? (
          <ul className="space-y-3">
            {insights.map((insight, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm text-muted-foreground"
              >
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {index + 1}
                </span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Log your first entry to receive personalized insights.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
