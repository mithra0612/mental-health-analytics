import { Flame, Zap } from "lucide-react";

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak?: number;
  isLoading?: boolean;
}

export function StreakWidget({ currentStreak, longestStreak, isLoading }: StreakWidgetProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="shimmer h-3 w-24 rounded mb-3" />
        <div className="shimmer h-9 w-20 rounded" />
      </div>
    );
  }

  const isActive = currentStreak > 0;

  return (
    <div className="fade-up rounded-xl border border-border bg-card p-5
      transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Current streak
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-bold text-foreground tabular-nums">
              {currentStreak}
            </span>
            <span className="text-sm text-muted-foreground font-medium">days</span>
          </div>
          {longestStreak !== undefined && longestStreak > 0 && (
            <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Best: {longestStreak} days
            </p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl
          transition-all duration-200
          ${isActive ? "bg-orange-50 text-orange-500" : "bg-secondary text-muted-foreground"}`}>
          <Flame className={`h-6 w-6 transition-all ${isActive ? "scale-110" : "scale-90 opacity-50"}`} />
        </div>
      </div>
      {currentStreak > 0 && (
        <div className="mt-4 flex gap-1">
          {[...Array(Math.min(currentStreak, 7))].map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full bg-foreground"
              style={{ opacity: 0.15 + (i / Math.max(currentStreak - 1, 1)) * 0.85 }}
            />
          ))}
          {currentStreak < 7 && [...Array(7 - currentStreak)].map((_, i) => (
            <div key={`empty-${i}`} className="h-1 flex-1 rounded-full bg-border" />
          ))}
        </div>
      )}
    </div>
  );
}
