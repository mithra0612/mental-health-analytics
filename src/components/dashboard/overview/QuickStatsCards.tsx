import React from "react";

interface StatProps {
  label: string;
  value: string | number | false | null | undefined;
  subtext?: string;
  icon?: React.ElementType;
  trend?: "up" | "down" | "neutral";
}

interface QuickStatsCardsProps {
  stats: StatProps[];
  isLoading?: boolean;
}

export function QuickStatsCards({ stats, isLoading }: QuickStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <div className="shimmer h-3 w-20 rounded mb-3" />
            <div className="shimmer h-7 w-14 rounded mb-1" />
            <div className="shimmer h-2.5 w-16 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="fade-up group relative rounded-xl border border-border bg-card p-4
              transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 hover:border-foreground/20
              cursor-default overflow-hidden"
          >
            {/* Subtle top line on hover */}
            <div className="absolute inset-x-0 top-0 h-px bg-foreground opacity-0
              group-hover:opacity-10 transition-opacity duration-200" />
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </p>
              {Icon && (
                <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground
                  transition-colors duration-200" />
              )}
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums leading-none mb-1">
              {stat.value ?? "—"}
            </p>
            {stat.subtext && (
              <p className="text-[11px] text-muted-foreground">{stat.subtext}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
