import { Card, CardContent } from "@/components/ui/card";

interface StatProps {
  label: string;
  value: string | number;
  subtext?: string;
}

interface QuickStatsCardsProps {
  stats: StatProps[];
  isLoading?: boolean;
}

export function QuickStatsCards({ stats, isLoading }: QuickStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-8 bg-muted rounded w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx}>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground font-medium">
              {stat.label}
            </p>
            <p className="text-2xl font-bold mt-2 text-foreground">
              {stat.value}
            </p>
            {stat.subtext && (
              <p className="text-xs text-muted-foreground mt-2">{stat.subtext}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
