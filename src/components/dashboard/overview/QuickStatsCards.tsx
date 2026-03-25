import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatProps {
  label: string;
  value: string | number | false | null | undefined;
  subtext?: string;
  icon?: React.ElementType;
}

interface QuickStatsCardsProps {
  stats: StatProps[];
  isLoading?: boolean;
}

export function QuickStatsCards({ stats, isLoading }: QuickStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-3 w-20 rounded bg-muted animate-pulse mb-3" />
              <div className="h-7 w-14 rounded bg-muted animate-pulse mb-1" />
              <div className="h-2.5 w-16 rounded bg-muted animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
                {Icon && (
                  <Icon className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <p className="text-2xl font-bold tabular-nums leading-none mb-1">
                {stat.value ?? "—"}
              </p>
              {stat.subtext && (
                <p className="text-xs text-muted-foreground">{stat.subtext}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
