type DashboardHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function DashboardHeader({
  title,
  description,
  actions,
}: DashboardHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-foreground leading-none">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 ml-4 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
