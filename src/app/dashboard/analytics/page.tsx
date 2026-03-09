"use client";

import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div>
      <DashboardHeader
        title="Analytics"
        description="Advanced trends, patterns, and metrics"
      />
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Analytics page with charts and metrics coming soon.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Features include: mood trends, stress analysis, sleep patterns,
              emotion distribution, trigger analysis, and correlations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
