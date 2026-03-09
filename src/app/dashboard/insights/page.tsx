"use client";

import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function InsightsPage() {
  return (
    <div>
      <DashboardHeader
        title="Insights"
        description="AI-generated patterns and recommendations"
      />
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Insights page with pattern analysis coming soon.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Features include: mood trends, sleep impact, stress patterns,
              trigger analysis, correlations, and personalized recommendations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
