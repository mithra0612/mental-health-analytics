import { Button } from "@/components/ui/button";
import { Plus, Smile, Brain, Moon, CheckCircle2 } from "lucide-react";

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
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="shimmer h-4 w-32 rounded mb-5" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="shimmer h-3 w-12 rounded mx-auto" />
              <div className="shimmer h-8 w-16 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!mood && mood !== 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center
        transition-all duration-200 hover:border-foreground/20 hover:bg-accent/30 group">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full
          bg-secondary mb-3 group-hover:scale-105 transition-transform duration-200">
          <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No entry yet today</p>
        <p className="text-xs text-muted-foreground mt-1 mb-4">Check in to track how you're feeling</p>
        {onLogEntry && (
          <Button
            onClick={onLogEntry}
            size="sm"
            className="text-xs gap-1.5 h-8 px-3 transition-all duration-150 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Log Today
          </Button>
        )}
      </div>
    );
  }

  const items = [
    { icon: Smile,  label: "Mood",   value: mood  ?? 0, display: `${mood}/5`,   sub: moodLabel(mood ?? 0) },
    { icon: Brain,  label: "Stress", value: stress ?? 0, display: `${stress}/10`, sub: stressLabel(stress ?? 0) },
    { icon: Moon,   label: "Sleep",  value: sleep  ?? 0, display: `${sleep}h`,   sub: "last night" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5 fade-up">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-medium text-foreground">Today</p>
        <span className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {items.map(({ icon: Icon, label, display, sub }) => (
          <div
            key={label}
            className="group flex flex-col items-center rounded-lg border border-border bg-secondary/30
              p-3 transition-all duration-200 hover:bg-secondary hover:border-foreground/20 hover:-translate-y-0.5"
          >
            <Icon className="h-4 w-4 text-muted-foreground mb-2 group-hover:text-foreground transition-colors" />
            <p className="text-2xl font-bold text-foreground tabular-nums leading-none mb-0.5">
              {display}
            </p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
