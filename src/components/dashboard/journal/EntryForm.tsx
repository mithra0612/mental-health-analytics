"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import type { IEntry } from "@/types";

const EMOTION_OPTIONS = [
  "Happy",
  "Calm",
  "Anxious",
  "Stressed",
  "Sad",
  "Angry",
  "Tired",
  "Energized",
  "Hopeful",
  "Overwhelmed",
];

interface EntryFormProps {
  initialDate?: Date;
  onSuccess?: (entry: IEntry) => void;
  isLoading?: boolean;
}

export function EntryForm({
  initialDate,
  onSuccess,
  isLoading,
}: EntryFormProps) {
  const [mood, setMood] = useState<number>(3);
  const [stress, setStress] = useState<number>(5);
  const [sleep, setSleep] = useState<number>(7);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleToggleEmotion = (emotion: string) => {
    setEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : [...prev, emotion]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const triggerArray = triggers
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      const entryData = {
        date: initialDate || new Date(),
        mood: parseInt(mood.toString()),
        stress: parseInt(stress.toString()),
        sleep: parseFloat(sleep.toString()),
        emotions,
        triggers: triggerArray,
        notes,
      };

      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        throw new Error("Failed to save entry");
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: "Entry saved successfully",
      });

      // Reset form
      setMood(3);
      setStress(5);
      setSleep(7);
      setEmotions([]);
      setTriggers("");
      setNotes("");

      if (onSuccess) {
        onSuccess(result.entry);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save entry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Daily Check-In</h3>
          </div>

          {/* Mood */}
          <div>
            <Label htmlFor="mood" className="text-sm font-medium mb-3 block">
              How is your mood? ({mood}/5)
            </Label>
            <div className="flex items-center gap-2">
              <input
                id="mood"
                type="range"
                min="1"
                max="5"
                value={mood}
                onChange={(e) => setMood(parseInt(e.target.value))}
                disabled={isSubmitting || isLoading}
                className="flex-1"
              />
              <span className="text-sm font-bold w-8">{mood}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              1 = Very bad, 5 = Excellent
            </p>
          </div>

          {/* Stress */}
          <div>
            <Label htmlFor="stress" className="text-sm font-medium mb-3 block">
              Stress level ({stress}/10)
            </Label>
            <div className="flex items-center gap-2">
              <input
                id="stress"
                type="range"
                min="1"
                max="10"
                value={stress}
                onChange={(e) => setStress(parseInt(e.target.value))}
                disabled={isSubmitting || isLoading}
                className="flex-1"
              />
              <span className="text-sm font-bold w-8">{stress}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              1 = Very calm, 10 = Very stressed
            </p>
          </div>

          {/* Sleep */}
          <div>
            <Label htmlFor="sleep" className="text-sm font-medium mb-3 block">
              Sleep hours ({sleep}h)
            </Label>
            <Input
              id="sleep"
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              max="24"
              value={sleep}
              onChange={(e) => setSleep(parseFloat(e.target.value) || 0)}
              disabled={isSubmitting || isLoading}
              placeholder="7.5"
            />
          </div>

          {/* Emotions */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              How are you feeling? (select all that apply)
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {EMOTION_OPTIONS.map((emotion) => (
                <div key={emotion} className="flex items-center space-x-2">
                  <Checkbox
                    id={emotion}
                    checked={emotions.includes(emotion)}
                    onCheckedChange={() => handleToggleEmotion(emotion)}
                    disabled={isSubmitting || isLoading}
                  />
                  <Label
                    htmlFor={emotion}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {emotion}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Triggers */}
          <div>
            <Label htmlFor="triggers" className="text-sm font-medium mb-3 block">
              What triggered your feelings? (comma-separated)
            </Label>
            <Input
              id="triggers"
              type="text"
              placeholder="e.g., work, lack of sleep, conflict"
              value={triggers}
              onChange={(e) => setTriggers(e.target.value)}
              disabled={isSubmitting || isLoading}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Separate multiple triggers with commas
            </p>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium mb-3 block">
              Notes
            </Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting || isLoading}
              placeholder="Write about your day, how you felt, anything else on your mind..."
              className="w-full px-3 py-2 border border-input rounded-md text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full"
          >
            {isSubmitting ? "Saving..." : "Save Entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
