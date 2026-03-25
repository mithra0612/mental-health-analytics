"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Flame,
  Target,
  Trophy,
  CheckCircle2,
  Trash2,
  TrendingUp,
  Calendar,
  Zap,
  RotateCcw,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Moon,
  Brain,
  Heart,
  Dumbbell,
  Droplets,
  BookOpen,
  Wind,
  ChevronDown,
  ChevronUp,
  ListChecks,
} from "lucide-react";
import type { IGoal, IHabit } from "@/types";

interface HabitData {
  completedDates: string[];
  streak: number;
  longestStreak: number;
  completedToday: boolean;
}

interface GoalWithHabit extends IGoal {
  habitData?: HabitData;
}

const defaultForm = {
  title: "",
  description: "",
  type: "custom" as "wellness" | "habit" | "custom",
  targetValue: "",
  unitOfMeasure: "",
  targetDate: "",
  frequency: "" as "" | "daily" | "weekly" | "monthly",
};

const TYPE_COLORS: Record<string, string> = {
  wellness:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  habit:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  custom: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

function daysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const GOAL_TEMPLATES = [
  { icon: Moon, label: "Sleep 8 hrs", title: "Sleep 8 hours a night", type: "wellness" as const, targetValue: 30, unitOfMeasure: "nights", frequency: "daily" as const, description: "Maintain a healthy sleep schedule by getting 8 hours each night." },
  { icon: Brain, label: "Meditate", title: "Daily meditation", type: "habit" as const, targetValue: 30, unitOfMeasure: "sessions", frequency: "daily" as const, description: "Practice mindfulness meditation for 10 minutes every day." },
  { icon: Droplets, label: "Hydrate", title: "Drink 8 glasses of water", type: "habit" as const, targetValue: 30, unitOfMeasure: "days", frequency: "daily" as const, description: "Stay hydrated by drinking at least 8 glasses of water daily." },
  { icon: Dumbbell, label: "Exercise", title: "Exercise 3× a week", type: "wellness" as const, targetValue: 12, unitOfMeasure: "sessions", frequency: "weekly" as const, description: "Get at least 30 minutes of physical activity 3 times a week." },
  { icon: Heart, label: "Gratitude", title: "Daily gratitude journal", type: "habit" as const, targetValue: 30, unitOfMeasure: "entries", frequency: "daily" as const, description: "Write 3 things you're grateful for each day." },
  { icon: BookOpen, label: "Read", title: "Read 20 min daily", type: "habit" as const, targetValue: 30, unitOfMeasure: "days", frequency: "daily" as const, description: "Read a book or article for at least 20 minutes every day." },
  { icon: Wind, label: "No screens", title: "Screen-free hour before bed", type: "habit" as const, targetValue: 30, unitOfMeasure: "nights", frequency: "daily" as const, description: "Avoid screens for 1 hour before bedtime to improve sleep quality." },
  { icon: Sparkles, label: "Self-care", title: "Weekly self-care ritual", type: "wellness" as const, targetValue: 4, unitOfMeasure: "sessions", frequency: "weekly" as const, description: "Dedicate at least one hour per week to a relaxing self-care activity." },
] as const;

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalWithHabit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressInputs, setProgressInputs] = useState<Record<string, string>>(
    {}
  );
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/goals");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch goals");
      const data = await res.json();

      const goalsData: GoalWithHabit[] = data.goals;

      const habitsRes = await fetch("/api/habits");
      if (habitsRes.ok) {
        const habitsData = await habitsRes.json();
        const habitMap = new Map<string, IHabit>(
          habitsData.habits.map((h: IHabit) => [h.goalId, h])
        );
        const todayStr = new Date().toISOString().split("T")[0];

        goalsData.forEach((goal) => {
          const habit = habitMap.get(goal._id!);
          if (habit) {
            const completedToday = habit.completedDates.some((d) => {
              return new Date(d).toISOString().split("T")[0] === todayStr;
            });
            goal.habitData = {
              completedDates: habit.completedDates.map(
                (d) => new Date(d).toISOString().split("T")[0]
              ),
              streak: habit.streak,
              longestStreak: habit.longestStreak,
              completedToday,
            };
          }
        });
      }

      setGoals(goalsData);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load goals",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.targetValue) {
      toast({
        title: "Error",
        description: "Title and target value are required",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          targetValue: Number(form.targetValue),
          frequency: form.frequency || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create goal");
      toast({ title: "Goal created!", description: `"${form.title}" has been added.` });
      setForm(defaultForm);
      setShowCreateDialog(false);
      fetchGoals();
    } catch {
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProgress = async (goalId: string, value: number) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentValue: value }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGoals((prev) =>
        prev.map((g) => (g._id === goalId ? { ...g, ...data.goal } : g))
      );
      toast({ title: "Progress updated!" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  const handleMarkComplete = async (goalId: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      if (!res.ok) throw new Error();
      setGoals((prev) =>
        prev.map((g) =>
          g._id === goalId ? { ...g, status: "completed" } : g
        )
      );
      toast({ title: "Goal completed!", description: "Congratulations! 🎉" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Delete this goal and all associated habit data?")) return;
    try {
      const res = await fetch(`/api/goals/${goalId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setGoals((prev) => prev.filter((g) => g._id !== goalId));
      toast({ title: "Goal deleted" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  const handleToggleHabit = async (goalId: string) => {
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const todayStr = new Date().toISOString().split("T")[0];
      setGoals((prev) =>
        prev.map((g) => {
          if (g._id !== goalId) return g;
          const updatedDates = data.completedToday
            ? [...(g.habitData?.completedDates ?? []), todayStr]
            : (g.habitData?.completedDates ?? []).filter(
              (d) => d !== todayStr
            );
          return {
            ...g,
            currentValue: data.habit.completedDates.length,
            habitData: {
              completedDates: updatedDates,
              streak: data.habit.streak,
              longestStreak: data.habit.longestStreak,
              completedToday: data.completedToday,
            },
          };
        })
      );
      toast({
        title: data.completedToday ? "Habit checked off! ✅" : "Habit unchecked",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update habit",
        variant: "destructive",
      });
    }
  };

  const filteredGoals = goals.filter((g) => {
    if (activeTab === "active") return g.status === "active";
    if (activeTab === "completed") return g.status === "completed";
    if (activeTab === "habits") return g.type === "habit" || !!g.frequency;
    return true;
  });

  const handleQuickAddTemplate = async (tpl: typeof GOAL_TEMPLATES[number]) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: tpl.title,
          description: tpl.description,
          type: tpl.type,
          targetValue: tpl.targetValue,
          unitOfMeasure: tpl.unitOfMeasure,
          frequency: tpl.frequency,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Goal added!", description: `"${tpl.title}" has been created.` });
      fetchGoals();
    } catch {
      toast({ title: "Error", description: "Failed to add goal", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");
  const habitGoals = goals.filter((g) => (g.type === "habit" || !!g.frequency) && g.status === "active");
  const todayHabitsCompleted = habitGoals.filter((g) => g.habitData?.completedToday).length;
  const overdueGoals = activeGoals.filter(
    (g) => g.targetDate && daysUntil(new Date(g.targetDate)) < 0
  );
  const upcomingGoals = activeGoals
    .filter((g) => g.targetDate && daysUntil(new Date(g.targetDate)) >= 0)
    .sort((a, b) => new Date(a.targetDate!).getTime() - new Date(b.targetDate!).getTime());
  const nextDeadline = upcomingGoals[0];
  const maxStreak = goals.reduce(
    (max, g) => Math.max(max, g.habitData?.streak ?? 0),
    0
  );
  const avgProgress =
    activeGoals.length > 0
      ? Math.round(
        activeGoals.reduce(
          (sum, g) =>
            sum + Math.min((g.currentValue / g.targetValue) * 100, 100),
          0
        ) / activeGoals.length
      )
      : 0;
  const completionRate =
    goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0;
  const stalledGoals = activeGoals.filter(
    (g) => g.type !== "habit" && !g.frequency && g.currentValue === 0 && g.targetDate && daysUntil(new Date(g.targetDate)) < 7
  );

  const last7Days = getLast7Days();

  return (
    <div>
      <DashboardHeader
        title="Goals & Habits"
        description="Track your personal wellness goals and daily habits"
        actions={
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Goal
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Active Goals",
              value: activeGoals.length,
              icon: Target,
              color: "text-blue-500",
              bg: "bg-blue-50 dark:bg-blue-900/20",
            },
            {
              label: "Completed",
              value: completedGoals.length,
              icon: Trophy,
              color: "text-yellow-500",
              bg: "bg-yellow-50 dark:bg-yellow-900/20",
            },
            {
              label: "Best Streak",
              value: `${maxStreak}d`,
              icon: Flame,
              color: "text-orange-500",
              bg: "bg-orange-50 dark:bg-orange-900/20",
            },
            {
              label: "Avg Progress",
              value: `${avgProgress}%`,
              icon: TrendingUp,
              color: "text-green-500",
              bg: "bg-green-50 dark:bg-green-900/20",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Focus + Insights */}
        {!isLoading && goals.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Today's Focus */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-violet-500" />
                  Today&apos;s Habits
                  {habitGoals.length > 0 && (
                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                      {todayHabitsCompleted}/{habitGoals.length} done
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {habitGoals.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-3 text-center">
                    No habit goals yet. Add one to build daily streaks!
                  </p>
                ) : (
                  <>
                    {habitGoals.map((g) => (
                      <div
                        key={g._id}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors"
                      >
                        <button
                          onClick={() => handleToggleHabit(g._id!)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${g.habitData?.completedToday
                              ? "bg-violet-500 border-violet-500 text-white"
                              : "border-muted-foreground/40 hover:border-violet-400"
                            }`}
                        >
                          {g.habitData?.completedToday && (
                            <Check className="h-3 w-3" />
                          )}
                        </button>
                        <span
                          className={`text-sm flex-1 ${g.habitData?.completedToday ? "line-through text-muted-foreground" : ""}`}
                        >
                          {g.title}
                        </span>
                        {g.habitData && g.habitData.streak > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-orange-500 font-medium">
                            <Flame className="h-3 w-3" />
                            {g.habitData.streak}
                          </span>
                        )}
                      </div>
                    ))}
                    {habitGoals.length > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Daily completion</span>
                          <span>
                            {habitGoals.length > 0
                              ? Math.round((todayHabitsCompleted / habitGoals.length) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${habitGoals.length > 0 ? (todayHabitsCompleted / habitGoals.length) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Insights panel */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Completion rate */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="h-4 w-4 text-yellow-500 shrink-0" />
                    <span>Completion rate</span>
                  </div>
                  <span className="text-sm font-semibold">{completionRate}%</span>
                </div>

                {/* Overdue warning */}
                {overdueGoals.length > 0 && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>
                        {overdueGoals.length} overdue goal
                        {overdueGoals.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab("active")}
                      className="text-xs underline underline-offset-2"
                    >
                      View
                    </button>
                  </div>
                )}

                {/* Next deadline */}
                {nextDeadline && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
                    <div className="flex items-center gap-2 text-sm min-w-0">
                      <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="truncate">{nextDeadline.title}</span>
                    </div>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 shrink-0 ml-2">
                      {daysUntil(new Date(nextDeadline.targetDate!)) === 0
                        ? "Due today"
                        : `${daysUntil(new Date(nextDeadline.targetDate!))}d left`}
                    </span>
                  </div>
                )}

                {/* Stalled goals */}
                {stalledGoals.length > 0 && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 shrink-0" />
                      <span>
                        {stalledGoals.length} goal
                        {stalledGoals.length > 1 ? "s" : ""} need attention
                      </span>
                    </div>
                  </div>
                )}

                {/* Motivational note */}
                {overdueGoals.length === 0 && stalledGoals.length === 0 && (
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      {activeGoals.length === 0
                        ? "Set your first goal to start your wellness journey."
                        : "You're on track! Keep up the great work."}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Goal Templates */}
        <Card>
          <CardHeader className="pb-0">
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => setShowTemplates((s) => !s)}
            >
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                Quick-add Templates
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  — add a common goal in one click
                </span>
              </CardTitle>
              {showTemplates ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </CardHeader>
          {showTemplates && (
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GOAL_TEMPLATES.map((tpl) => {
                  const Icon = tpl.icon;
                  const alreadyExists = goals.some(
                    (g) => g.title === tpl.title
                  );
                  return (
                    <button
                      key={tpl.label}
                      disabled={isSubmitting || alreadyExists}
                      onClick={() => handleQuickAddTemplate(tpl)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors ${alreadyExists
                          ? "border-muted bg-muted/30 text-muted-foreground cursor-default"
                          : "border-border hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs">{tpl.label}</span>
                      {alreadyExists && (
                        <span className="text-[10px] text-muted-foreground">
                          Added
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Goals Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeGoals.length})
            </TabsTrigger>
            <TabsTrigger value="habits">Habits ({habitGoals.length})</TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedGoals.length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({goals.length})</TabsTrigger>
          </TabsList>

          {(["active", "habits", "completed", "all"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              {isLoading ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6 h-44 animate-pulse bg-muted/20 rounded-xl" />
                    </Card>
                  ))}
                </div>
              ) : filteredGoals.length === 0 ? (
                <Card>
                  <CardContent className="p-12 flex flex-col items-center gap-4 text-center">
                    <Target className="h-12 w-12 text-muted-foreground/30" />
                    <div>
                      <p className="font-medium text-muted-foreground">
                        No goals here yet
                      </p>
                      <p className="text-sm text-muted-foreground/60 mt-1">
                        {activeTab === "completed"
                          ? "Complete some active goals to see them here."
                          : "Create your first goal to start tracking progress!"}
                      </p>
                    </div>
                    {activeTab !== "completed" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowCreateDialog(true)}
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Create Goal
                        </Button>
                        <Button
                          onClick={() => setShowTemplates(true)}
                          size="sm"
                          variant="ghost"
                          className="gap-2"
                        >
                          <Sparkles className="h-4 w-4" />
                          Use Template
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredGoals.map((goal) => {
                    const pct = Math.min(
                      Math.round((goal.currentValue / goal.targetValue) * 100),
                      100
                    );
                    const isHabit = goal.type === "habit" || !!goal.frequency;
                    const isOverdue =
                      goal.targetDate &&
                      new Date(goal.targetDate) < new Date() &&
                      goal.status === "active";
                    const daysLeft =
                      goal.targetDate && goal.status === "active"
                        ? daysUntil(new Date(goal.targetDate))
                        : null;

                    return (
                      <Card
                        key={goal._id}
                        className={
                          goal.status === "completed" ? "opacity-75" : ""
                        }
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                                <span
                                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[goal.type]}`}
                                >
                                  {goal.type}
                                </span>
                                {goal.frequency && (
                                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                    {goal.frequency}
                                  </span>
                                )}
                                {goal.status === "completed" && (
                                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Done
                                  </span>
                                )}
                                {isOverdue && (
                                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Overdue
                                  </span>
                                )}
                                {daysLeft !== null && !isOverdue && daysLeft <= 7 && (
                                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
                                  </span>
                                )}
                              </div>
                              <CardTitle className="text-base leading-tight">
                                {goal.title}
                              </CardTitle>
                              {goal.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {goal.description}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive shrink-0 -mr-2 -mt-1 h-8 w-8 p-0"
                              onClick={() => handleDeleteGoal(goal._id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Progress bar with milestone markers */}
                          <div>
                            <div className="flex justify-between text-sm mb-1.5">
                              <span className="text-muted-foreground">
                                Progress
                              </span>
                              <span className="font-medium tabular-nums">
                                {goal.currentValue} / {goal.targetValue}
                                {goal.unitOfMeasure && (
                                  <span className="text-muted-foreground ml-1">
                                    {goal.unitOfMeasure}
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="relative h-2.5 bg-muted rounded-full overflow-visible">
                              {/* Milestone ticks */}
                              {[25, 50, 75].map((m) => (
                                <div
                                  key={m}
                                  className={`absolute top-0 h-full w-px ${pct >= m ? "bg-white/60" : "bg-muted-foreground/20"}`}
                                  style={{ left: `${m}%` }}
                                />
                              ))}
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${pct >= 100
                                    ? "bg-green-500"
                                    : pct >= 60
                                      ? "bg-blue-500"
                                      : pct >= 30
                                        ? "bg-blue-400"
                                        : "bg-blue-300"
                                  }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <div className="flex gap-3">
                                {[25, 50, 75].map((m) => (
                                  <span
                                    key={m}
                                    className={`text-[10px] ${pct >= m ? "text-blue-500 font-semibold" : "text-muted-foreground/50"}`}
                                  >
                                    {m}%
                                  </span>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {pct}% complete
                              </p>
                            </div>
                          </div>

                          {/* Habit 7-day tracker */}
                          {isHabit && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">
                                Last 7 days
                              </p>
                              <div className="flex gap-1.5">
                                {last7Days.map((day) => {
                                  const done =
                                    goal.habitData?.completedDates.includes(
                                      day
                                    ) ?? false;
                                  const dayLabel = new Date(
                                    day + "T12:00:00"
                                  ).toLocaleDateString("en-US", {
                                    weekday: "short",
                                  })[0];
                                  return (
                                    <div
                                      key={day}
                                      className="flex flex-col items-center gap-1"
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${done
                                            ? "bg-violet-500 text-white"
                                            : "bg-muted text-muted-foreground"
                                          }`}
                                      >
                                        {done ? (
                                          <Check className="h-4 w-4" />
                                        ) : (
                                          dayLabel
                                        )}
                                      </div>
                                      <span className="text-[10px] text-muted-foreground">
                                        {dayLabel}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                              {goal.habitData && (
                                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Flame className="h-3 w-3 text-orange-400" />
                                    {goal.habitData.streak} day streak
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Zap className="h-3 w-3 text-yellow-400" />
                                    {goal.habitData.longestStreak} best
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Check className="h-3 w-3 text-green-400" />
                                    {goal.habitData.completedDates.length} total
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Target date */}
                          {goal.targetDate && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              <span>
                                Target:{" "}
                                {new Date(goal.targetDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                              {daysLeft !== null && daysLeft >= 0 && (
                                <span className="ml-auto font-medium text-blue-500">
                                  {daysLeft === 0 ? "Due today" : `${daysLeft} days left`}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          {goal.status === "active" && (
                            <div className="flex gap-2 flex-wrap pt-1">
                              {isHabit ? (
                                <Button
                                  size="sm"
                                  variant={
                                    goal.habitData?.completedToday
                                      ? "secondary"
                                      : "default"
                                  }
                                  className="gap-1.5 flex-1"
                                  onClick={() =>
                                    handleToggleHabit(goal._id!)
                                  }
                                >
                                  {goal.habitData?.completedToday ? (
                                    <>
                                      <RotateCcw className="h-3.5 w-3.5" />
                                      Undo Today
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-3.5 w-3.5" />
                                      Mark Today Done
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <Input
                                      type="number"
                                      placeholder={String(
                                        goal.currentValue + 1
                                      )}
                                      value={progressInputs[goal._id!] ?? ""}
                                      onChange={(e) =>
                                        setProgressInputs((prev) => ({
                                          ...prev,
                                          [goal._id!]: e.target.value,
                                        }))
                                      }
                                      className="h-8 text-sm"
                                      min={0}
                                      max={goal.targetValue}
                                    />
                                    <Button
                                      size="sm"
                                      className="h-8 gap-1 shrink-0"
                                      onClick={() => {
                                        const val =
                                          progressInputs[goal._id!];
                                        handleUpdateProgress(
                                          goal._id!,
                                          val
                                            ? Number(val)
                                            : goal.currentValue + 1
                                        );
                                        setProgressInputs((prev) => ({
                                          ...prev,
                                          [goal._id!]: "",
                                        }));
                                      }}
                                    >
                                      <TrendingUp className="h-3.5 w-3.5" />
                                      Update
                                    </Button>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 gap-1 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950 shrink-0"
                                    onClick={() =>
                                      handleMarkComplete(goal._id!)
                                    }
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Complete
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Create Goal Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateGoal} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="goal-title">Title *</Label>
              <Input
                id="goal-title"
                placeholder="e.g. Meditate daily, Run 50 km this month"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal-description">Description</Label>
              <Textarea
                id="goal-description"
                placeholder="What is this goal about?"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      type: v as typeof form.type,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wellness">Wellness</SelectItem>
                    <SelectItem value="habit">Habit</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Frequency</Label>
                <Select
                  value={form.frequency || "none"}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      frequency: (v === "none" ? "" : v) as typeof form.frequency,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="goal-target">Target Value *</Label>
                <Input
                  id="goal-target"
                  type="number"
                  placeholder="e.g. 30"
                  value={form.targetValue}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, targetValue: e.target.value }))
                  }
                  min={1}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal-unit">Unit</Label>
                <Input
                  id="goal-unit"
                  placeholder="e.g. km, sessions"
                  value={form.unitOfMeasure}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unitOfMeasure: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal-date">Target Date</Label>
              <Input
                id="goal-date"
                type="date"
                value={form.targetDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, targetDate: e.target.value }))
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Goal"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
