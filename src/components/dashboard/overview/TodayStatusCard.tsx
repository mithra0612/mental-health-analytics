import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Smile, Brain, Moon } from "lucide-react";

interface TodayStatusCardProps {
  mood?: number;
  stress?: number;
  sleep?: number;
  isLoading?: boolean;
  onLogEntry?: () => void;
}

const moodLabel = (v: number) => {
  if (v >= 5) return "Excellent";
  if (v >= 4) return "Good";
  if (v >= 3) return "Okay";
  if (v >= 2) return "Low";
  return "Difficult";
};

const stressLabel = (v: number) => {
  if (v <= 2) return "Very calm";
  if (v <= 4) return "Calm";
  if (v <= 6) return "Moderate";
  if (v <= 8) return "Elevated";
  return "High";
};

export function TodayStatusCard({
  mood,
  stress,
  sleep,
  isLoading,
  onLogEntry,
}: TodayStatusCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-12 rounded bg-muted animate-pulse mx-auto" />
                <div className="h-8 w-16 rounded bg-muted animate-pulse mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mood && mood !== 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-3">
            <Smile className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No entry yet today</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Check in to track how you&apos;re feeling
          </p>
          {onLogEntry && (
            <Button onClick={onLogEntry} size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Log Today
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const items = [
    { icon: Smile, label: "Mood", display: `${mood}/5`, sub: moodLabel(mood ?? 0) },
    { icon: Brain, label: "Stress", display: `${stress}/10`, sub: stressLabel(stress ?? 0) },
    { icon: Moon, label: "Sleep", display: `${sleep}h`, sub: "Last night" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Today</CardTitle>
          <span className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {items.map(({ icon: Icon, label, display, sub }) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-lg border p-3 text-center"
            >
              <Icon className="h-4 w-4 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold tabular-nums leading-none mb-0.5">
                {display}
              </p>
              <p className="text-[11px] text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
