"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  ChevronRight,
  ChevronLeft,
  Target,
  Moon,
  Activity,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const PURPOSES = [
  { id: "track-mood", label: "Track mood", icon: "😊" },
  { id: "improve-sleep", label: "Improve sleep", icon: "😴" },
  { id: "manage-stress", label: "Manage stress", icon: "🧘" },
  { id: "build-habits", label: "Build healthy habits", icon: "💪" },
  { id: "monitor-anxiety", label: "Monitor anxiety", icon: "🌊" },
  { id: "increase-mindfulness", label: "Increase mindfulness", icon: "🧠" },
  { id: "track-emotions", label: "Track emotions", icon: "❤️" },
  { id: "personal-growth", label: "Personal growth", icon: "🌱" },
];

const GOALS = [
  "Feel more in control",
  "Understand my patterns",
  "Reduce stress",
  "Sleep better",
  "Build consistency",
  "Improve relationships",
  "Boost productivity",
  "Find balance",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [stressBaseline, setStressBaseline] = useState(5);
  const [sleepHours, setSleepHours] = useState("7");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const togglePurpose = (purposeId: string) => {
    setSelectedPurposes((prev) =>
      prev.includes(purposeId)
        ? prev.filter((p) => p !== purposeId)
        : [...prev, purposeId]
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purposes: selectedPurposes.map(
            (id) => PURPOSES.find((p) => p.id === id)?.label || id
          ),
          stressBaseline,
          sleepHours: parseInt(sleepHours),
          goals: selectedGoals,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      toast({
        title: "Welcome!",
        description: "Your dashboard is ready. Let's start your journey!",
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedPurposes.length > 0;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return selectedGoals.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg rounded-2xl shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-colors ${
                  s === step ? "bg-primary" : s < step ? "bg-primary/50" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <CardTitle className="text-xl">
            {step === 1 && "What brings you here?"}
            {step === 2 && "Your current stress level"}
            {step === 3 && "Your sleep habits"}
            {step === 4 && "What are your goals?"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Select all that apply to personalize your experience"}
            {step === 2 && "This helps us track your progress"}
            {step === 3 && "Tell us about your typical sleep"}
            {step === 4 && "What do you hope to achieve?"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {PURPOSES.map((purpose) => (
                <button
                  key={purpose.id}
                  onClick={() => togglePurpose(purpose.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedPurposes.includes(purpose.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-2xl block mb-1">{purpose.icon}</span>
                  <span className="text-sm font-medium">{purpose.label}</span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-center gap-4">
                <Activity className="w-8 h-8 text-primary" />
                <span className="text-4xl font-bold text-primary">
                  {stressBaseline}
                </span>
                <span className="text-muted-foreground">/10</span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressBaseline}
                  onChange={(e) => setStressBaseline(parseInt(e.target.value))}
                  className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Very Low</span>
                  <span>Moderate</span>
                  <span>Very High</span>
                </div>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                On a typical day, how stressed do you feel?
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-center gap-4">
                <Moon className="w-8 h-8 text-indigo-600" />
                <span className="text-4xl font-bold text-indigo-600">
                  {sleepHours}
                </span>
                <span className="text-muted-foreground">hours</span>
              </div>
              <div className="space-y-2">
                <Label>How many hours do you usually sleep?</Label>
                <Select value={sleepHours} onValueChange={setSleepHours}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hours" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(11)].map((_, i) => (
                      <SelectItem key={i} value={(i + 4).toString()}>
                        {i + 4} hours
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                {parseInt(sleepHours) >= 7 && parseInt(sleepHours) <= 9
                  ? "Great! That's within the recommended range."
                  : parseInt(sleepHours) < 7
                  ? "Most adults need 7-9 hours of sleep."
                  : "That's more than average. Quality matters too!"}
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-amber-500" />
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {GOALS.map((goal) => (
                  <Badge
                    key={goal}
                    variant={selectedGoals.includes(goal) ? "default" : "outline"}
                    className="cursor-pointer py-2 px-3"
                    onClick={() => toggleGoal(goal)}
                  >
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Started
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
