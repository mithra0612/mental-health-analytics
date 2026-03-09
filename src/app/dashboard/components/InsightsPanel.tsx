"use client";

import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InsightsPanelProps {
  insights: { title: string; description: string; color: string }[];
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow ${insight.color}`}
              >
                <h3 className="text-lg font-medium text-foreground mb-2">{insight.title}</h3>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Log your first entry to receive personalized insights.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
