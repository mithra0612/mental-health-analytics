"use client";

import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function GoalsPage() {
  return (
    <div>
      <DashboardHeader
        title="Goals & Habits"
        description="Track your personal wellness goals and habits"
      />
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Goals and habits tracking interface coming soon.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Features include: goal creation and tracking, habit consistency
              monitoring, progress indicators, milestones, and streak tracking.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
