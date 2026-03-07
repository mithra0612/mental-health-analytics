"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const EMOTIONS = [
  "Happy",
  "Calm",
  "Anxious",
  "Sad",
  "Angry",
  "Grateful",
  "Excited",
  "Tired",
  "Stressed",
  "Hopeful",
  "Lonely",
  "Content",
];

const TRIGGERS = [
  "Work",
  "Family",
  "Health",
  "Finance",
  "Relationships",
  "Social Media",
  "News",
  "Sleep",
  "Weather",
  "Exercise",
];

interface EntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingEntry?: {
    mood: number;
    stress: number;
    sleep: number;
    emotions: string[];
    notes: string;
    triggers: string[];
  } | null;
}

export default function EntryForm({
  open,
  onOpenChange,
  existingEntry,
}: EntryFormProps) {
  const [mood, setMood] = useState(existingEntry?.mood || 3);
  const [stress, setStress] = useState(existingEntry?.stress || 5);
  const [sleep, setSleep] = useState(existingEntry?.sleep?.toString() || "7");
  const [emotions, setEmotions] = useState<string[]>(existingEntry?.emotions || []);
  const [triggers, setTriggers] = useState<string[]>(existingEntry?.triggers || []);
  const [notes, setNotes] = useState(existingEntry?.notes || "");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const moodEmojis = ["😢", "😔", "😐", "🙂", "😊"];

  const toggleEmotion = (emotion: string) => {
    setEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : [...prev, emotion]
    );
  };

  const toggleTrigger = (trigger: string) => {
    setTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          stress,
          sleep: parseFloat(sleep),
          emotions,
          triggers,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save entry");
      }

      toast({
        title: "Entry saved!",
        description: "Your daily entry has been recorded.",
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Daily Check-in</DialogTitle>
          <DialogDescription>
            How are you feeling today? Track your mental health.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Mood (1-5)</Label>
            <div className="flex justify-between gap-2">
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setMood(index + 1)}
                  className={`flex-1 py-3 text-2xl rounded-xl border-2 transition-all ${
                    mood === index + 1
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Stress Level (1-10): {stress}</Label>
            <input
              type="range"
              min="1"
              max="10"
              value={stress}
              onChange={(e) => setStress(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="sleep">Hours of Sleep</Label>
            <Select value={sleep} onValueChange={setSleep}>
              <SelectTrigger>
                <SelectValue placeholder="Select hours" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(13)].map((_, i) => (
                  <SelectItem key={i} value={(i + 4).toString()}>
                    {i + 4} hours
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Emotions (select all that apply)</Label>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map((emotion) => (
                <Badge
                  key={emotion}
                  variant={emotions.includes(emotion) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleEmotion(emotion)}
                >
                  {emotion}
                  {emotions.includes(emotion) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Triggers (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {TRIGGERS.map((trigger) => (
                <Badge
                  key={trigger}
                  variant={triggers.includes(trigger) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTrigger(trigger)}
                >
                  {trigger}
                  {triggers.includes(trigger) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any thoughts or reflections..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Entry"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
