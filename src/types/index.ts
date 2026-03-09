export interface IUser {
  _id?: string;
  email: string;
  passwordHash: string;
  profile: {
    name: string;
    avatar?: string;
  };
  preferences: {
    purposes: string[];
    stressBaseline: number;
    sleepHours: number;
    goals: string[];
    notifications: boolean;
  };
  dashboardConfig: {
    showMoodChart: boolean;
    showSleepChart: boolean;
    showStressChart: boolean;
  };
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEntry {
  _id?: string;
  userId: string;
  date: Date;
  mood: number;
  stress: number;
  sleep: number;
  emotions: string[];
  notes: string;
  triggers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnalytics {
  _id?: string;
  userId: string;
  period: string;
  weeklyMoodAvg: number;
  sleepAvg: number;
  stressTrend: number;
  streak: number;
  insights: string[];
  computedAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  onboardingCompleted: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

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
