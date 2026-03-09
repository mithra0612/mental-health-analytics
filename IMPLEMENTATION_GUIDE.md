3# Mental Wellness App - Implementation Guide

## Quick Start: Key Files to Create/Modify

### 1. Create New Models

**`src/models/Goal.ts`**
```typescript
import mongoose, { Schema, Model } from "mongoose";
import type { IGoal } from "@/types";

const GoalSchema = new Schema<IGoal>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["wellness", "habit", "custom"],
      default: "custom",
    },
    targetValue: {
      type: Number,
      required: true,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    unitOfMeasure: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
    startDate: {
      type: Date,
      default: () => new Date(),
    },
    targetDate: {
      type: Date,
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
    },
  },
  {
    timestamps: true,
  }
);

const Goal: Model<IGoal> =
  mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);

export default Goal;
```

**`src/models/Habit.ts`** 
```typescript
import mongoose, { Schema, Model } from "mongoose";
import type { IHabit } from "@/types";

const HabitSchema = new Schema<IHabit>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    goalId: {
      type: String,
      required: true,
    },
    completedDates: {
      type: [Date],
      default: [],
    },
    streak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Habit: Model<IHabit> =
  mongoose.models.Habit || mongoose.model<IHabit>("Habit", HabitSchema);

export default Habit;
```

**`src/models/ChatSession.ts`**
```typescript
import mongoose, { Schema, Model } from "mongoose";
import type { IChatSession } from "@/types";

const ChatMessageSchema = new Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: () => new Date() },
});

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [ChatMessageSchema],
    summary: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const ChatSession: Model<IChatSession> =
  mongoose.models.ChatSession || 
  mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);

export default ChatSession;
```

---

### 2. Extend Types

**`src/types/index.ts`** - Add these to your existing file:

```typescript
// Existing interfaces remain unchanged, add:

export interface IGoal {
  _id?: string;
  userId: string;
  title: string;
  description?: string;
  type: "wellness" | "habit" | "custom";
  targetValue: number;
  currentValue: number;
  unitOfMeasure: string;
  status: "active" | "completed" | "archived";
  startDate: Date;
  targetDate?: Date;
  frequency?: "daily" | "weekly" | "monthly";
  createdAt: Date;
  updatedAt: Date;
}

export interface IHabit {
  _id?: string;
  userId: string;
  goalId: string;
  completedDates: Date[];
  streak: number;
  longestStreak: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatSession {
  _id?: string;
  userId: string;
  messages: ChatMessage[];
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSession {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IInsight {
  _id?: string;
  userId: string;
  type: "trend" | "pattern" | "correlation" | "recommendation";
  title: string;
  description: string;
  data: Record<string, any>;
  generatedAt: Date;
  period: "weekly" | "monthly";
  relevance: "high" | "medium" | "low";
}

// Report types
export interface WeeklyReport {
  weekStart: Date;
  weekEnd: Date;
  stats: {
    moodAvg: number;
    sleepAvg: number;
    stressAvg: number;
    entriesLogged: number;
  };
  emotions: Array<{ emotion: string; count: number }>;
  triggers: Array<{ trigger: string; count: number }>;
  insights: string[];
}

export interface MonthlyReport extends WeeklyReport {
  monthStart: Date;
  monthEnd: Date;
  weeklyBreakdown: WeeklyReport[];
  trends: {
    moodTrend: number;
    sleepTrend: number;
    stressTrend: number;
  };
}
```

---

### 3. Create Layout Components

**`src/components/layout/Sidebar.tsx`**

```typescript
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  BarChart3,
  Lightbulb,
  Sparkles,
  Target,
  FileText,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "./UserMenu";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard/overview", icon: <Home className="h-5 w-5" /> },
  { label: "Journal", href: "/dashboard/journal", icon: <BookOpen className="h-5 w-5" /> },
  { label: "Analytics", href: "/dashboard/analytics", icon: <BarChart3 className="h-5 w-5" /> },
  { label: "Insights", href: "/dashboard/insights", icon: <Lightbulb className="h-5 w-5" /> },
  { label: "AI Assistant", href: "/dashboard/assistant", icon: <Sparkles className="h-5 w-5" /> },
  { label: "Goals & Habits", href: "/dashboard/goals", icon: <Target className="h-5 w-5" /> },
  { label: "Reports", href: "/dashboard/reports", icon: <FileText className="h-5 w-5" /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    return pathname.startsWith(href.replace("/dashboard", ""));
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-screen">
          {/* Brand */}
          <div className="p-6 border-b border-border">
            <Link href="/dashboard/overview" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center font-bold">
                M
              </div>
              <div>
                <p className="font-semibold text-foreground">Mind.</p>
                <p className="text-xs text-muted-foreground">Mental Wellness</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Utility Section */}
          <div className="border-t border-border p-4 space-y-2">
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive("/dashboard/settings")
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          </div>

          {/* User Menu */}
          <div className="border-t border-border p-4">
            <UserMenu />
          </div>
        </div>
      </aside>

      {/* Main Content Area Padding */}
      <div className="hidden md:block" />
    </>
  );
}
```

**`src/components/layout/UserMenu.tsx`**

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface UserData {
  name: string;
  email: string;
}

export function UserMenu() {
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <User className="h-4 w-4 mr-2" />
          <div className="flex-1 text-left">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem disabled>
          <User className="h-4 w-4 mr-2" />
          <span>Profile would go here</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**`src/components/layout/DashboardHeader.tsx`**

```typescript
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
    <div className="border-b border-border">
      <div className="flex items-center justify-between p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
```

---

### 4. Create Dashboard Layout

**`src/app/dashboard/layout.tsx`**

```typescript
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!session.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
```

---

### 5. Create Library Functions

**`src/lib/insights.ts`**

```typescript
import { IEntry } from "@/types";

export interface InsightResult {
  type: "trend" | "pattern" | "correlation" | "recommendation";
  title: string;
  description: string;
  relevance: "high" | "medium" | "low";
}

export function generateWeeklyInsights(entries: IEntry[]): InsightResult[] {
  const insights: InsightResult[] = [];

  if (entries.length === 0) return insights;

  // Mood trend
  const moods = entries.map((e) => e.mood);
  const moodTrend = calculateTrend(moods);

  if (moodTrend > 0.15) {
    insights.push({
      type: "trend",
      title: "Mood Improving",
      description: `Your mood improved ${Math.round(moodTrend * 100)}% this week`,
      relevance: "high",
    });
  } else if (moodTrend < -0.15) {
    insights.push({
      type: "trend",
      title: "Mood Declining",
      description: `Your mood declined ${Math.round(Math.abs(moodTrend) * 100)}% this week`,
      relevance: "high",
    });
  }

  // Sleep quality
  const sleepAvg =
    entries.reduce((sum, e) => sum + e.sleep, 0) / entries.length;
  if (sleepAvg >= 7.5 && sleepAvg <= 8.5) {
    insights.push({
      type: "recommendation",
      title: "Great Sleep Pattern",
      description: `You're consistently getting ${sleepAvg.toFixed(1)} hours of sleep`,
      relevance: "medium",
    });
  } else if (sleepAvg < 6) {
    insights.push({
      type: "recommendation",
      title: "Increase Sleep",
      description: `Consider aiming for 7-9 hours. Currently at ${sleepAvg.toFixed(1)} hours`,
      relevance: "high",
    });
  }

  // Emotion frequency
  const emotionCounts = analyzeEmotions(entries);
  const topEmotion = emotionCounts[0];
  if (topEmotion) {
    insights.push({
      type: "pattern",
      title: `Most Common: ${topEmotion.emotion}`,
      description: `You felt ${topEmotion.emotion.toLowerCase()} ${topEmotion.count} times this week`,
      relevance: "medium",
    });
  }

  // Trigger analysis
  const triggers = analyzeTriggers(entries);
  if (triggers.length > 0) {
    insights.push({
      type: "pattern",
      title: "Top Triggers Identified",
      description: `"${triggers[0].trigger}" affected you the most`,
      relevance: "medium",
    });
  }

  return insights;
}

function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const avg1 = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
  const avg2 = secondHalf.reduce((a, b) => a + b) / secondHalf.length;
  return (avg2 - avg1) / avg1;
}

function analyzeEmotions(entries: IEntry[]): Array<{ emotion: string; count: number }> {
  const counts: Record<string, number> = {};

  entries.forEach((entry) => {
    entry.emotions.forEach((emotion) => {
      counts[emotion] = (counts[emotion] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function analyzeTriggers(entries: IEntry[]): Array<{ trigger: string; count: number }> {
  const counts: Record<string, number> = {};

  entries.forEach((entry) => {
    entry.triggers.forEach((trigger) => {
      counts[trigger] = (counts[trigger] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export { analyzeEmotions, analyzeTriggers };
```

**`src/lib/correlations.ts`**

```typescript
import { IEntry } from "@/types";

export function calculatePearsonCorrelation(arr1: number[], arr2: number[]): number {
  if (arr1.length !== arr2.length || arr1.length < 2) return 0;

  const n = arr1.length;
  const mean1 = arr1.reduce((a, b) => a + b) / n;
  const mean2 = arr2.reduce((a, b) => a + b) / n;

  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;

  for (let i = 0; i < n; i++) {
    const diff1 = arr1[i] - mean1;
    const diff2 = arr2[i] - mean2;
    numerator += diff1 * diff2;
    denominator1 += diff1 * diff1;
    denominator2 += diff2 * diff2;
  }

  const denominator = Math.sqrt(denominator1 * denominator2);
  return denominator === 0 ? 0 : numerator / denominator;
}

export function getSleepMoodCorrelation(entries: IEntry[]): {
  correlation: number;
  insight: string;
} {
  const sleep = entries.map((e) => e.sleep);
  const mood = entries.map((e) => e.mood);

  const corr = calculatePearsonCorrelation(sleep, mood);

  let insight = "";
  if (corr > 0.6) {
    insight = "Strong: More sleep strongly correlates with better mood";
  } else if (corr > 0.3) {
    insight = "Moderate: You tend to feel better with more sleep";
  } else if (corr < -0.3) {
    insight = "Your mood appears less dependent on sleep alone";
  } else {
    insight = "Sleep and mood show no strong correlation for you";
  }

  return { correlation: corr, insight };
}

export function getStressMoodCorrelation(entries: IEntry[]): {
  correlation: number;
  insight: string;
} {
  const stress = entries.map((e) => e.stress);
  const mood = entries.map((e) => e.mood);

  // Invert stress to show negative correlation makes sense
  const invertedStress = stress.map((s) => 11 - s);
  const corr = calculatePearsonCorrelation(invertedStress, mood);

  let insight = "";
  if (corr > 0.6) {
    insight = "Strong: Lower stress strongly correlates with better mood";
  } else if (corr > 0.3) {
    insight = "Moderate: Reducing stress helps your mood";
  } else {
    insight = "Stress and mood show limited correlation for you";
  }

  return { correlation: corr, insight };
}
```

---

### 6. API Route Examples

**`src/app/api/journal/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Entry from "@/models/Entry";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const emotion = searchParams.get("emotion");
    const trigger = searchParams.get("trigger");
    const query = searchParams.get("q");

    let filter: Record<string, any> = { userId: session.id };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (emotion) {
      filter.emotions = emotion;
    }

    if (trigger) {
      filter.triggers = trigger;
    }

    if (query) {
      filter.notes = { $regex: query, $options: "i" };
    }

    const entries = await Entry.find(filter).sort({ date: -1 }).limit(100);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Journal GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**`src/app/api/insights/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Entry from "@/models/Entry";
import { generateWeeklyInsights } from "@/lib/insights";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const period = request.nextUrl.searchParams.get("period") || "7d";
    const days = period === "7d" ? 7 : 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await Entry.find({
      userId: session.id,
      date: { $gte: startDate },
    }).sort({ date: -1 });

    const insights = generateWeeklyInsights(entries);

    return NextResponse.json({ insights, entryCount: entries.length });
  } catch (error) {
    console.error("Insights GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

---

### 7. Example Pages

**`src/app/dashboard/overview/page.tsx`** (minimal example)

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { useToast } from "@/components/ui/use-toast";

export default function OverviewPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/analytics");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setData(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load overview",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router, toast]);

  return (
    <div>
      <DashboardHeader
        title="Overview"
        description="Your mental wellness at a glance"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => router.push("/dashboard/journal")}>
              <Plus className="h-4 w-4 mr-2" />
              Log Entry
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard/assistant")}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Ask Assistant
            </Button>
          </div>
        }
      />
      <div className="p-6">
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <p className="text-muted-foreground">
              Overview content will be built here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Implementation Tips

### Authentication & Session Management
- Keep the existing `lib/auth.ts`
- Middleware already handles route protection
- All authenticated pages check `getSession()` server-side

### Data Fetching Strategy
- Use Server Components for initial layout and auth checks
- Use Client Components for interactive features and forms
- Fetch data in parallel with `Promise.all()` where possible
- Implement proper error boundaries

### Styling
- Keep using Tailwind classes
- Shadow UI components from `components/ui/`
- Use existing theme colors (no new color palette)
- Responsive: mobile-first with md: breakpoint for desktop

### Database
- Keep using Mongoose connection
- Use existing connection pattern in `lib/db.ts`
- Add proper indexes on frequently queried fields
- Use timestamps on all models

### Forms & Validation
- Create form validation in `lib/validators.ts`
- Use React state with onChange handlers
- Provide clear error messages
- Show loading states during submission

### Error Handling
- Check status codes in API calls
- Redirect to login on 401
- Use toast for user feedback
- Log errors server-side only

---

## Folder Structure Command (Optional)

To create the new folder structure at once, run in terminal:

```bash
mkdir -p src/components/layout
mkdir -p src/components/dashboard/overview
mkdir -p src/components/dashboard/journal
mkdir -p src/components/dashboard/analytics
mkdir -p src/components/dashboard/insights
mkdir -p src/components/dashboard/assistant
mkdir -p src/components/dashboard/goals
mkdir -p src/components/dashboard/reports
mkdir -p src/components/dashboard/settings
mkdir -p src/app/dashboard/overview
mkdir -p src/app/dashboard/journal
mkdir -p src/app/dashboard/analytics
mkdir -p src/app/dashboard/insights
mkdir -p src/app/dashboard/assistant
mkdir -p src/app/dashboard/goals
mkdir -p src/app/dashboard/reports
mkdir -p src/app/api/journal
mkdir -p src/app/api/insights
mkdir -p src/app/api/goals
mkdir -p src/app/api/habits
mkdir -p src/app/api/reports
```

---

## Next Steps

1. **Create new models** (Goal, Habit, ChatSession)
2. **Add types** to types/index.ts
3. **Create layout components** (Sidebar, UserMenu, DashboardHeader)
4. **Create dashboard/layout.tsx** with sidebar wrapper
5. **Create library functions** (insights, correlations, reports)
6. **Create API routes** for new endpoints
7. **Build pages** in order of priority
8. **Test each page** as you build
9. **Polish and deploy**

This guide should give you everything needed to start implementing the new design. Follow the REDESIGN_PLAN.md for architectural details and this guide for code examples.
