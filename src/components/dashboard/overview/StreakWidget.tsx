import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak?: number;
  isLoading?: boolean;
}

export function StreakWidget({
  currentStreak,
  longestStreak,
  isLoading,
}: StreakWidgetProps) {
  if (isLoading)
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-8 bg-muted rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-2">
              Current Streak
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{currentStreak}</p>
              <p className="text-sm text-muted-foreground">days</p>
            </div>
            {longestStreak && (
              <p className="text-xs text-muted-foreground mt-2">
                Personal best: {longestStreak} days
              </p>
            )}
          </div>
          <Flame className="h-8 w-8 text-orange-500" />
        </div>
      </CardContent>
    </Card>
  );
}
