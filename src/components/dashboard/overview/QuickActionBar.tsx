import { Button } from "@/components/ui/button";
import { Plus, MessageCircle } from "lucide-react";

interface QuickActionBarProps {
  onLogEntry?: () => void;
  onAskAssistant?: () => void;
  isLoading?: boolean;
}

export function QuickActionBar({
  onLogEntry,
  onAskAssistant,
  isLoading,
}: QuickActionBarProps) {
  return (
    <div className="flex gap-3">
      <Button
        onClick={onLogEntry}
        disabled={isLoading}
        className="flex-1"
      >
        <Plus className="h-4 w-4 mr-2" />
        Log Entry
      </Button>
      <Button
        onClick={onAskAssistant}
        disabled={isLoading}
        variant="outline"
        className="flex-1"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Ask Assistant
      </Button>
    </div>
  );
}
