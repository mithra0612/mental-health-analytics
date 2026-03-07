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
