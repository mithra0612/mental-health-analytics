import { Button } from "@/components/ui/button";
import { PenLine, Bot } from "lucide-react";

interface QuickActionBarProps {
  onLogEntry?: () => void;
  onAskAssistant?: () => void;
  isLoading?: boolean;
}

export function QuickActionBar({ onLogEntry, onAskAssistant, isLoading }: QuickActionBarProps) {
  return (
    <div className="flex gap-2.5">
      <Button
        onClick={onLogEntry}
        disabled={isLoading}
        className="flex-1 gap-2 h-9 text-sm font-medium shadow-none
          transition-all duration-150 active:scale-[0.98]"
      >
        <PenLine className="h-4 w-4" />
        Log Today
      </Button>
      <Button
        onClick={onAskAssistant}
        disabled={isLoading}
        variant="outline"
        className="flex-1 gap-2 h-9 text-sm font-medium
          transition-all duration-150 active:scale-[0.98]
          hover:bg-foreground hover:text-background hover:border-foreground"
      >
        <Bot className="h-4 w-4" />
        Ask AI
      </Button>
    </div>
  );
}
