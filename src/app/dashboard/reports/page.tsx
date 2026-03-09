"use client";

import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div>
      <DashboardHeader
        title="Reports"
        description="Weekly and monthly wellness summaries"
      />
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Reports interface coming soon.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Features include: weekly summaries, monthly reports, mood
              analysis, sleep trend reports, stress analysis, emotion
              frequency, and export options.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
