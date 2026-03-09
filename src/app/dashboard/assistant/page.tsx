"use client";

import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function AssistantPage() {
  return (
    <div>
      <DashboardHeader
        title="AI Assistant"
        description="Chat with your wellness assistant"
      />
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              AI Assistant chat interface coming soon.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Features include: conversational wellness guidance, prompt
              suggestions, context-aware responses based on your entries, and
              session history.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
