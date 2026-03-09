import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import type { IEntry } from "@/types";

interface JournalListProps {
  entries: IEntry[];
  isLoading?: boolean;
  onEdit?: (entry: IEntry) => void;
  onDelete?: (entryId: string) => void;
}

export function JournalList({
  entries,
  isLoading,
  onEdit,
  onDelete,
}: JournalListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No entries found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Start journaling to see your entries here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <Card key={entry._id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <div className="mt-2 flex gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Mood</p>
                    <p className="font-semibold text-accent">{entry.mood}/5</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Stress</p>
                    <p className="font-semibold text-accent">{entry.stress}/10</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sleep</p>
                    <p className="font-semibold text-accent">{entry.sleep}h</p>
                  </div>
                </div>
                {entry.notes && (
                  <p className="text-sm mt-3 text-foreground line-clamp-2">
                    {entry.notes}
                  </p>
                )}
                {entry.emotions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.emotions.slice(0, 3).map((emotion) => (
                      <span
                        key={emotion}
                        className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                      >
                        {emotion}
                      </span>
                    ))}
                    {entry.emotions.length > 3 && (
                      <span className="text-xs text-muted-foreground px-2 py-1">
                        +{entry.emotions.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(entry)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (entry._id) onDelete(entry._id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
