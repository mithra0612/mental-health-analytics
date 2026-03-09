import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TodayStatusCardProps {
  mood?: number;
  stress?: number;
  sleep?: number;
  isLoading?: boolean;
  onLogEntry?: () => void;
}

export function TodayStatusCard({
  mood,
  stress,
  sleep,
  isLoading,
  onLogEntry,
}: TodayStatusCardProps) {
  if (isLoading)
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-8 bg-muted rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );

  if (!mood && mood !== 0 && !stress && !sleep) {
    return (
      <Card>
        <CardContent className="p-6 text-center py-8">
          <p className="text-muted-foreground font-medium">
            No entry logged today
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Start your daily check-in to see your status
          </p>
          {onLogEntry && (
            <Button onClick={onLogEntry} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Log Today
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-6">Today's Status</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Mood</p>
            <p className="text-3xl font-bold text-foreground">{mood}/5</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Stress</p>
            <p className="text-3xl font-bold text-foreground">{stress}/10</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Sleep</p>
            <p className="text-3xl font-bold text-foreground">{sleep}h</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
