# Mental Wellness SaaS Redesign Plan

## Executive Summary

Transform the mental wellness app from a single-page dashboard into a premium, multi-section SaaS product with a persistent sidebar navigation and enhanced features including journaling, analytics, insights, goals/habits tracking, and an improved AI assistant.

---

## Part 1: Information Architecture

### New Sidebar Structure

```
┌─────────────────────────────────────────┐
│  Mind.                                  │
│  Mental Wellness  [Theme Toggle]        │
├─────────────────────────────────────────┤
│                                         │
│  NAVIGATION                             │
│  ├─ Overview           [Home icon]      │
│  ├─ Journal            [BookOpen icon]  │
│  ├─ Analytics          [BarChart3 icon] │
│  ├─ Insights           [Lightbulb icon] │
│  ├─ AI Assistant       [Sparkles icon]  │
│  ├─ Goals & Habits     [Target icon]    │
│  └─ Reports            [FileText icon]  │
│                                         │
│  UTILITY                                │
│  ├─ Settings           [Settings icon]  │
│  └─ [User Profile]     [User icon]      │
│      └─ Profile                         │
│      └─ Logout                          │
│                                         │
└─────────────────────────────────────────┘
```

---

## Part 2: Page Structure & Features

### 1. **Overview** (`/app/dashboard/overview/page.tsx`)
**Purpose:** High-level summary of current mental wellness state

**Components:**
- **Today's Status Card**: Current mood, stress, sleep
- **Check-in Completion**: Did user log today?
- **Quick Stats**: 
  - Weekly mood average
  - Sleep average
  - Stress level
  - Current streak (days logging in)
- **Mood Streak Widget**: Visual representation
- **Quick Action Bar**: 
  - "Log Today" button
  - "Ask Assistant" button
  - "View Insights" link
- **Weekly Activity Timeline**: Last 7 days mini view
- **Risk Indicators**: 
  - Low mood warning
  - Sleep deprivation notice
  - High stress alert
- **Insight Cards**: 1-2 top insights from this week
- **Compact Trend Widgets**: Small sparkline charts for mood/sleep/stress

**Layout:** 4-column grid on desktop, responsive stack on mobile

---

### 2. **Journal** (`/app/dashboard/journal/page.tsx`)
**Purpose:** Daily check-in and journal history explorer

**Subpages:**
- `/app/dashboard/journal/` - Journal list with date picker + entry form
- `/app/dashboard/journal/[date]/` - Single entry detail page

**Components:**
- **Date Picker / Calendar**: Browse entries by date
- **Today's Entry Form**:
  - Mood (1-5 scale with visual indicators)
  - Stress (1-10 scale)
  - Sleep (0-24 hours)
  - Emotions (multi-select checkboxes: happy, anxious, calm, energized, tired, etc.)
  - Triggers (multi-select tag input)
  - Notes (rich textarea)
  - Save/Update button with success feedback
  
- **Journal History List**:
  - Filter by: date range, mood, stress level, emotion, trigger
  - Search within notes
  - Cards showing date, mood emoji-free indicator, brief preview
  - Quick action: view/edit/delete
  
- **Entry Detail Modal/Drawer**:
  - Full entry view
  - Edit capability
  - Related entries from same week
  - Associated insights
  
- **Empty State**: "Start journaling to see patterns"

**Data to Store/Fetch:**
- Single entry per day per user
- Upsert logic: update if exists, create if new

---

### 3. **Analytics** (`/app/dashboard/analytics/page.tsx`)
**Purpose:** Advanced trend analysis and metrics

**Subpages:**
- `/app/dashboard/analytics/` - Main analytics dashboard

**Components:**
- **Timeframe Switcher**: Last 7 days, Last 30 days, Last 90 days, Custom range
- **Mood Trend Chart**: Line chart with rolling avg
- **Stress Trend Chart**: Area chart showing peaks
- **Sleep Trend Chart**: Bar chart with goal line
- **Emotion Distribution**: Pie/donut chart - which emotions appear most?
- **Trigger Pattern Chart**: Top 10 triggers, frequency bar chart
- **Habit Consistency Metrics**:
  - Journaling completion %
  - Days with sleep goal met
  - Days with stress below baseline
  
- **Streak Breakdown**:
  - Current streak
  - Longest streak
  - Journaling frequency
  
- **Correlation Cards** (read-only insights):
  - Sleep vs Mood correlation
  - Stress vs Sleep correlation
  - Exercise/movement vs Mood (if logged)
  
- **Filter Controls**:
  - By emotion
  - By trigger
  - Date range
  
- **Export Button**: Download as CSV for selected period

**Charts:** Use Recharts with responsive containers

---

### 4. **Insights** (`/app/dashboard/insights/page.tsx`)
**Purpose:** AI-generated or rule-based interpretation of patterns

**Components:**
- **Key Insight Cards** (each is a summary):
  - "This week your mood is X% higher than last week"
  - "Sleep has improved by X hours on average"
  - "Stress trending downward"
  - "On days you journal, mood is X% higher"
  
- **Pattern Summary Section**:
  - "What changed this week?"
  - "Possible patterns noticed:"
    - "You sleep better on weekends"
    - "Stress spikes on Mondays"
  - "Recommended focus areas"
  
- **Risk Indicators**:
  - Persistent low mood (red)
  - Chronic sleep deprivation (orange)
  - Sustained high stress (orange)
  
- **Positive Reinforcement**:
  - "Great job keeping your streak!"
  - "You've logged every day this week"
  - "Your average mood improved 2 points"
  
- **Weekly Summary**:
  - Best day
  - Worst day
  - Most logged emotion
  - Most common trigger
  
- **Suggested Actions** (CTA):
  - "Try journaling about X trigger"
  - "Consider increasing sleep for better mood"

**Content:** Mix of computed insights from backend + rule-based suggestions

---

### 5. **AI Assistant** (`/app/dashboard/assistant/page.tsx`)
**Purpose:** Dedicated conversational wellness assistant

**Components:**
- **Chat Interface**:
  - Message history (scrollable)
  - User messages (right-aligned)
  - Assistant messages (left-aligned)
  - Timestamp for each message
  
- **Message Input**:
  - Textarea with send button
  - Character count
  - Optional voice input placeholder (future)
  
- **Prompt Suggestions** (when chat is empty):
  - "Summarize my last 7 days"
  - "What affected my mood most?"
  - "How is sleep impacting my stress?"
  - "What should I focus on this week?"
  - "Give me coping tips for X emotion"
  - "What patterns do you notice?"
  
- **Context Menu** (above suggestions):
  - "Chat uses your recent journal entries"
  - "Powered by AI insights"
  
- **Session History** (optional, bottom):
  - Previous conversation dates
  - Quick summaries
  - Load history button (if implementable)
  
- **Empty State**: "Chat with your wellness assistant to explore patterns"

**Backend Logic:**
- Send user message
- Include recent journal entries + computed insights as context
- Return AI response
- Store in ChatSession collection

---

### 6. **Goals & Habits** (`/app/dashboard/goals/page.tsx`)
**Purpose:** Track personal improvement and habit consistency

**Subpages:**
- `/app/dashboard/goals/` - Goals overview
- `/app/dashboard/goals/[id]/` - Goal detail and progress

**Components:**
- **Goals Setup Section**:
  - Predefined goals (searchable):
    - "Sleep 8 hours daily"
    - "Reduce stress below 5/10 daily"
    - "Journal every day"
    - "Weekly reflection"
    - "Move for 30 minutes daily"
    - "Practice meditation"
    - Custom goal creation
  
- **Active Goals Cards**:
  - Goal name
  - Current progress (%)
  - Target/deadline
  - Completion status or days remaining
  - Check-off today button
  - Small sparkline of last 30 days
  
- **Habit Tracker**:
  - Grid: 7 days × habit
  - Checkmarks on logged days
  - Consistency % for each habit
  
- **Progress Indicators**:
  - Days on track
  - Milestones passed
  - Next milestone
  
- **Suggested Focus Areas** (from insights):
  - Based on user's lowest-scoring metrics
  - Personalized recommendations
  
- **Empty State**: "Set your first goal to start tracking"

**Data Model Updates:**
- New Goal collection
- Goal.userId, title, description, type, targetValue, currentValue, startDate, deadline, status

---

### 7. **Reports** (`/app/dashboard/reports/page.tsx`)
**Purpose:** Structured summaries and exports

**Subpages:**
- `/app/dashboard/reports/` - Report selection
- `/app/dashboard/reports/weekly/` - Weekly summary
- `/app/dashboard/reports/monthly/` - Monthly summary

**Components:**
- **Report Type Selector** (tabs or cards):
  - Weekly Summary
  - Monthly Summary
  - Custom Period
  
- **Weekly Report**:
  - Report header: "Week of [date]"
  - Stats block: mood avg, sleep avg, stress level, entries count
  - Mood Summary: high, low, average
  - Sleep Summary: best night, worst night, average
  - Stress Summary: peak days, average
  - Emotions: most frequent emotions with counts
  - Triggers: top triggers during week
  - Journaling: days logged, consistency
  - Insights Summary: key patterns from that week
  - Print/Download buttons
  
- **Monthly Report**:
  - All above for 4-week period
  - Trend comparison (this month vs last month)
  - Progress on goals
  - All-time stats (if useful)
  
- **Report Cards**:
  - Clean, card-based layout
  - Each metric in its own card
  - Icon + label + value
  
- **Export Options**:
  - PDF (printable)
  - CSV
  - JSON (existing export feature enhanced)

**Layout:** Professional, report-style, suitable for printing

---

### 8. **Settings** (`/app/dashboard/settings/page.tsx`)
**Purpose:** Account and preference management

**Tabs/Sections:**
1. **Profile**
   - Name (editable)
   - Email (display, change via separate flow)
   - Avatar/profile picture
   - Delete account button (with confirmation)

2. **Tracking Setup**
   - Tracking purposes (checkboxes)
   - Stress baseline (1-10 slider)
   - Sleep goal (hours, slider)
   - Preferred mood scale explanation
   - Emotion list (customizable, add/remove emotions)

3. **Notification Settings**
   - Email reminders for journaling
   - Daily check-in reminder (time)
   - Weekly summary email
   - Insights notifications
   - Toggle all on/off

4. **Privacy & Data**
   - Data export (CSV, JSON)
   - Data deletion options
   - Privacy policy link
   - Terms link
   - GDPR compliance notes

5. **Account Security**
   - Change password (form)
   - Sessions/devices (list)
   - Two-factor auth (if implementing)

6. **Theme Preferences**
   - Light/Dark/System toggle
   - Font size preference (optional)

**Keep theme system exactly as is** - just expose it in settings if not already accessible

---

## Part 3: Folder Structure

```
src/
├── app/
│   ├── (auth)/                    # Auth routes (unchanged)
│   │   ├── login/
│   │   └── signup/
│   ├── api/
│   │   ├── auth/                  # Auth endpoints (unchanged)
│   │   ├── entries/               # GET/POST/PUT entries
│   │   ├── journal/               # New: search, filter entries
│   │   ├── analytics/             # Enhanced analytics calcs
│   │   ├── insights/              # New: rules engine for insights
│   │   ├── goals/                 # New: CRUD goals
│   │   ├── habits/                # New: habit tracking
│   │   ├── chat/                  # Enhanced AI chat
│   │   ├── reports/               # New: report generation
│   │   ├── export/                # Keep existing, enhance
│   │   └── settings/              # New: preference updates
│   ├── dashboard/
│   │   ├── layout.tsx             # NEW: Sidebar layout
│   │   ├── overview/
│   │   │   └── page.tsx           # NEW
│   │   ├── journal/
│   │   │   ├── page.tsx           # NEW
│   │   │   └── [date]/
│   │   │       └── page.tsx       # NEW
│   │   ├── analytics/
│   │   │   └── page.tsx           # NEW (extend current)
│   │   ├── insights/
│   │   │   └── page.tsx           # NEW
│   │   ├── assistant/
│   │   │   └── page.tsx           # NEW (rename from chat/)
│   │   ├── goals/
│   │   │   ├── page.tsx           # NEW
│   │   │   └── [id]/
│   │   │       └── page.tsx       # NEW
│   │   ├── reports/
│   │   │   ├── page.tsx           # NEW
│   │   │   ├── weekly/
│   │   │   │   └── page.tsx       # NEW
│   │   │   └── monthly/
│   │   │       └── page.tsx       # NEW
│   │   ├── settings/
│   │   │   └── page.tsx           # ENHANCE existing
│   │   └── page.tsx               # Keep or redirect to /overview
│   ├── onboarding/                # Keep existing
│   ├── page.tsx                   # Keep root redirect logic
│   └── layout.tsx                 # Keep root layout
├── components/
│   ├── layout/                    # NEW: Layout components
│   │   ├── Sidebar.tsx            # Main sidebar navigation
│   │   ├── SidebarNav.tsx         # Nav links component
│   │   ├── UserMenu.tsx           # User dropdown
│   │   ├── MobileNav.tsx          # Mobile sheet/drawer
│   │   └── DashboardHeader.tsx    # Page header with title
│   ├── dashboard/                 # NEW: Dashboard-specific components
│   │   ├── overview/
│   │   │   ├── TodayStatusCard.tsx
│   │   │   ├── CheckInCard.tsx
│   │   │   ├── QuickStatsCards.tsx
│   │   │   ├── StreakWidget.tsx
│   │   │   ├── QuickActionBar.tsx
│   │   │   ├── ActivityTimeline.tsx
│   │   │   ├── RiskIndicators.tsx
│   │   │   └── InsightCards.tsx
│   │   ├── journal/
│   │   │   ├── EntryForm.tsx      # NEW (enhance from dashboard)
│   │   │   ├── JournalList.tsx
│   │   │   ├── EntryCard.tsx
│   │   │   ├── JournalFilters.tsx
│   │   │   ├── EntrySearch.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   └── EntryDetail.tsx
│   │   ├── analytics/
│   │   │   ├── TimeframeSelector.tsx
│   │   │   ├── MoodTrendChart.tsx
│   │   │   ├── StressTrendChart.tsx
│   │   │   ├── SleepTrendChart.tsx
│   │   │   ├── EmotionDistribution.tsx
│   │   │   ├── TriggerPatternChart.tsx
│   │   │   ├── HabitConsistency.tsx
│   │   │   ├── StreakBreakdown.tsx
│   │   │   └── CorrelationCards.tsx
│   │   ├── insights/
│   │   │   ├── InsightCard.tsx
│   │   │   ├── PatternSummary.tsx
│   │   │   ├── RiskIndicators.tsx
│   │   │   ├── WeeklySummary.tsx
│   │   │   ├── SuggestedActions.tsx
│   │   │   └── PositiveReinforcement.tsx
│   │   ├── assistant/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── PromptSuggestions.tsx
│   │   │   ├── SessionHistory.tsx
│   │   │   └── ContextInfo.tsx
│   │   ├── goals/
│   │   │   ├── GoalsList.tsx
│   │   │   ├── GoalCard.tsx
│   │   │   ├── GoalForm.tsx
│   │   │   ├── HabitTracker.tsx
│   │   │   ├── ProgressIndicators.tsx
│   │   │   ├── GoalDetail.tsx
│   │   │   └── SuggestedGoals.tsx
│   │   ├── reports/
│   │   │   ├── ReportSelector.tsx
│   │   │   ├── WeeklyReport.tsx
│   │   │   ├── MonthlyReport.tsx
│   │   │   ├── ReportCard.tsx
│   │   │   ├── ReportStats.tsx
│   │   │   ├── ExportOptions.tsx
│   │   │   └── ReportLayout.tsx
│   │   └── settings/
│   │       ├── ProfileSection.tsx
│   │       ├── TrackingSetup.tsx
│   │       ├── NotificationSettings.tsx
│   │       ├── PrivacySettings.tsx
│   │       ├── SecuritySettings.tsx
│   │       └── SettingsTabs.tsx
│   ├── current dashboard/
│   │   ├── StatsCards.tsx        # Keep/refactor
│   │   ├── MoodChart.tsx         # Keep/refactor
│   │   ├── SleepChart.tsx        # Keep/refactor
│   │   ├── StressChart.tsx       # Keep/refactor
│   │   ├── InsightsPanel.tsx     # Keep/refactor
│   │   └── EntryForm.tsx         # Move to dashboard/journal/
│   ├── theme-provider.tsx        # Keep unchanged
│   ├── theme-toggle.tsx          # Keep unchanged
│   └── ui/                       # Keep all existing UI components
├── lib/
│   ├── auth.ts                   # Keep unchanged
│   ├── db.ts                     # Keep unchanged
│   ├── utils.ts                  # Keep unchanged
│   ├── analytics.ts              # ENHANCE with more metrics
│   ├── insights.ts               # NEW: insights engine
│   ├── goals.ts                  # NEW: goals logic
│   ├── reports.ts                # NEW: report generation
│   ├── triggers.ts               # NEW: trigger analysis
│   ├── correlations.ts           # NEW: correlation logic
│   └── validators.ts             # NEW: form validation
├── models/
│   ├── User.ts                   # Keep, add fields
│   ├── Entry.ts                  # Keep, already has needed fields
│   ├── Analytics.ts              # Keep, enhance
│   ├── Goal.ts                   # NEW
│   ├── Habit.ts                  # NEW
│   ├── ChatSession.ts            # NEW
│   └── Insight.ts                # NEW (optional, could compute on-fly)
├── types/
│   └── index.ts                  # Extend with new types
├── styles/
│   └── globals.css               # Keep, add sidebar styles
└── middleware.ts                 # Keep unchanged
```

---

## Part 4: Model Updates

### Extend IUser

```typescript
interface IUser {
  // ... existing fields
  preferences: {
    purposes: string[];           // existing
    stressBaseline: number;        // existing
    sleepHours: number;            // existing
    goals: string[];               // existing
    notifications: boolean;        // existing
    emailReminders: boolean;       // NEW
    dailyReminderTime: string;     // NEW (HH:MM format)
    weeklyReports: boolean;        // NEW
    insightsNotifications: boolean; // NEW
    emotions: string[];            // NEW: custom emotion list
  };
}
```

### New: IGoal

```typescript
interface IGoal {
  _id?: string;
  userId: string;
  title: string;
  description?: string;
  type: "wellness" | "habit" | "custom";
  targetValue: number;            // e.g., 8 (hours), 5 (stress level)
  currentValue: number;
  unitOfMeasure: string;           // "hours", "level", "days", etc.
  status: "active" | "completed" | "archived";
  startDate: Date;
  targetDate?: Date;
  frequency?: "daily" | "weekly" | "monthly";
  createdAt: Date;
  updatedAt: Date;
}
```

### New: IHabit

```typescript
interface IHabit {
  _id?: string;
  userId: string;
  goalId: string;                  // reference to Goal
  completedDates: Date[];          // array of dates completed
  streak: number;
  longestStreak: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### New: IChatSession

```typescript
interface IChatSession {
  _id?: string;
  userId: string;
  messages: ChatMessage[];
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
```

### New: IInsight (optional - can compute on-fly)

```typescript
interface IInsight {
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
```

---

## Part 5: New API Routes

### Journal Routes
```
GET  /api/journal
     Query: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&emotion=&stress=&mood=
     Response: { entries: IEntry[] }

POST /api/journal/search
     Body: { query: string }
     Response: { results: IEntry[] }

GET  /api/journal/[date]
     Response: { entry: IEntry }

POST /api/entries  (existing, keep)
```

### Analytics Routes (Enhanced)
```
GET  /api/analytics
     Response: { analytics: IAnalytics, chartData: [...] }

GET  /api/analytics/compare
     Query: ?period=7d|30d|90d
     Response: { comparison: ComparisonData }

GET  /api/analytics/correlations
     Response: { sleepMoodCorr: number, stressMoodCorr: number, ... }
```

### Insights Routes (New)
```
GET  /api/insights
     Query: ?period=7d|30d
     Response: { insights: IInsight[] }

GET  /api/insights/summary
     Response: { weekSummary: Summary, patterns: string[] }
```

### Goals Routes (New)
```
GET  /api/goals
     Response: { goals: IGoal[] }

POST /api/goals
     Body: { title, description, type, targetValue, deadline }
     Response: { goal: IGoal }

PUT  /api/goals/[id]
     Body: { currentValue, status }
     Response: { goal: IGoal }

DELETE /api/goals/[id]
     Response: { success: boolean }
```

### Habits Routes (New)
```
GET  /api/habits
     Response: { habits: IHabit[] }

POST /api/habits/[habitId]/complete
     Body: { date: Date }
     Response: { habit: IHabit }

GET  /api/habits/consistency
     Query: ?range=7d|30d|90d
     Response: { consistency: number }
```

### Reports Routes (New)
```
GET  /api/reports/weekly
     Query: ?date=YYYY-MM-DD
     Response: { report: WeeklyReport }

GET  /api/reports/monthly
     Query: ?year=2024&month=12
     Response: { report: MonthlyReport }

GET  /api/reports/export
     Query: ?format=csv|json|pdf&period=7d|30d
     Response: binary file or JSON
```

### Chat Routes (Enhanced)
```
POST /api/chat
     Body: { message: string }
     Response: { response: string, sessionId: string }

GET  /api/chat/sessions
     Response: { sessions: IChatSession[] }

GET  /api/chat/[sessionId]
     Response: { session: IChatSession }
```

---

## Part 6: Step-by-Step Implementation Plan

### **Phase 0: Preparation** (1-2 days)
- [ ] Create models: Goal.ts, Habit.ts, ChatSession.ts
- [ ] Extend types in types/index.ts
- [ ] Create lib files: insights.ts, goals.ts, reports.ts, triggers.ts, correlations.ts
- [ ] Create validation lib
- [ ] Update User model schema

### **Phase 1: Layout & Navigation** (1-2 days)
- [ ] Create dashboard/layout.tsx with sidebar
- [ ] Create Sidebar.tsx component
- [ ] Create SidebarNav.tsx
- [ ] Create UserMenu.tsx
- [ ] Create MobileNav.tsx (responsive drawer)
- [ ] Create DashboardHeader.tsx
- [ ] Update global styles for sidebar layout
- [ ] Test responsive behavior

### **Phase 2: Overview Page** (1 day)
- [ ] Create /dashboard/overview/ page
- [ ] Build all overview components:
  - TodayStatusCard
  - CheckInCard
  - QuickStatsCards
  - StreakWidget
  - QuickActionBar
  - RiskIndicators
  - InsightCards
- [ ] Create API endpoints for overview data
- [ ] Connect to existing analytics

### **Phase 3: Journal Pages** (2 days)
- [ ] Create /dashboard/journal/ page
- [ ] Create /dashboard/journal/[date]/ page
- [ ] Build journal components:
  - EntryForm (refactored from current)
  - JournalList
  - EntryCard
  - JournalFilters
  - EntrySearch
  - DatePicker
  - EntryDetail
- [ ] Create journal API routes
- [ ] Add search/filter logic to backend

### **Phase 4: Analytics Page** (2 days)
- [ ] Create /dashboard/analytics/ page
- [ ] Build all chart components
- [ ] Implement timeframe selector
- [ ] Add correlation logic
- [ ] Enhance lib/analytics.ts
- [ ] Add CSV export

### **Phase 5: Insights Page** (1-2 days)
- [ ] Create /dashboard/insights/ page
- [ ] Build insights components
- [ ] Create lib/insights.ts (rules engine)
- [ ] Implement API route
- [ ] Create correlation logic
- [ ] Add risk indicators calculation

### **Phase 6: AI Assistant Page** (1-2 days)
- [ ] Create /dashboard/assistant/ page
- [ ] Build chat components
- [ ] Enhance chat API with context
- [ ] Add prompt suggestions logic
- [ ] Optional: Session history
- [ ] Connect to insights for context

### **Phase 7: Goals & Habits** (2 days)
- [ ] Create Goal and Habit models
- [ ] Create /dashboard/goals/ page
- [ ] Create /dashboard/goals/[id]/ page
- [ ] Build all goals components
- [ ] Create API routes for CRUD
- [ ] Implement habit tracking logic
- [ ] Add progress calculations

### **Phase 8: Reports Page** (1-2 days)
- [ ] Create /dashboard/reports/ page
- [ ] Create /dashboard/reports/weekly/ page
- [ ] Create /dashboard/reports/monthly/ page
- [ ] Build all report components
- [ ] Create lib/reports.ts
- [ ] Implement PDF/CSV export logic
- [ ] Style for printing

### **Phase 9: Enhanced Settings** (1 day)
- [ ] Refactor current settings page
- [ ] Add tabs/sections structure
- [ ] Build settings components
- [ ] Add notification preference endpoints
- [ ] Keep theme system unchanged

### **Phase 10: Testing & Polish** (2 days)
- [ ] Test all pages responsively
- [ ] Test navigation flow
- [ ] Test data fetching and loading states
- [ ] Add error boundaries
- [ ] Optimize images/performance
- [ ] Mobile testing

---

## Part 7: Component Hierarchy & Data Flow

### Example: Overview Page

```
OverviewPage
├── DashboardHeader (title: "Overview")
├── QuickStatsCards (from /api/analytics)
├── TodayStatusCard (from /api/entries with today's date)
├── QuickActionBar
│   └── buttons: "Log Today", "Ask Assistant"
├── StreakWidget (computed in lib/analytics.ts)
├── RiskIndicators (from insights engine)
├── WeekActivityTimeline
│   └── maps last 7 days of entries
└── InsightCards (from /api/insights)
```

### Data Fetching Patterns

```typescript
// In page.tsx (Server Component or useEffect)
const fetchOverviewData = async () => {
  const [analytics, todayEntry, insights, user] = await Promise.all([
    fetch('/api/analytics'),
    fetch('/api/entries?date=today'),
    fetch('/api/insights?period=7d'),
    fetch('/api/auth/me')
  ]);
};
```

---

## Part 8: Refactoring Current Code

### MoodChart, StressChart, SleepChart
- **Keep:** Core rendering logic
- **Refactor:** Extract to dashboard/analytics/ components
- **Enhance:** Add timeframe props, responsive sizing
- **Reuse:** In multiple pages (overview, analytics, reports)

### EntryForm
- **Keep:** Form logic, validation
- **Move:** To components/dashboard/journal/
- **Enhance:** Add emotion/trigger multi-select
- **Reuse:** In journal page + overview quick log

### StatsCards
- **Keep:** Stats display logic
- **Refactor:** Create specialized card types
- **Reuse:** In overview, analytics, reports

### InsightsPanel
- **Keep:** Panel structure
- **Move:** To components/dashboard/insights/
- **Enhance:** Expand with pattern summaries, recommendations
- **Retire:** Old insights, replace with new Insights page

### DashboardPage (current /dashboard)
- **Refactor:** Move content to /overview/
- **Keep:** As redirect or remove entirely
- **Replace:** With new sidebar structure

---

## Part 9: CSS & Styling Considerations

### Sidebar Layout
```css
/* Main layout */
.dashboard-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}

/* Mobile */
@media (max-width: 768px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    transform: translateX(-100%);
    z-index: 40;
    transition: transform 0.3s ease;
  }
  .sidebar.open {
    transform: translateX(0);
  }
}

/* Active nav link */
.nav-link.active {
  background-color: var(--accent-color);
  color: var(--accent-foreground);
}
```

### Page Header
```css
.page-header {
  border-bottom: 1px solid var(--border-color);
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--foreground);
}
```

---

## Part 10: Key Features Implementation Details

### 1. **Entry Search & Filter**
```typescript
// lib/triggers.ts
export function filterEntries(
  entries: IEntry[],
  filters: {
    moodRange?: [number, number];
    stressRange?: [number, number];
    emotions?: string[];
    triggers?: string[];
    dateRange?: [Date, Date];
  }
): IEntry[] {
  return entries.filter(entry => {
    const moodMatch = !filters.moodRange || 
      (entry.mood >= filters.moodRange[0] && entry.mood <= filters.moodRange[1]);
    const stressMatch = !filters.stressRange || 
      (entry.stress >= filters.stressRange[0] && entry.stress <= filters.stressRange[1]);
    const emotionMatch = !filters.emotions?.length || 
      filters.emotions.some(e => entry.emotions.includes(e));
    const triggerMatch = !filters.triggers?.length || 
      filters.triggers.some(t => entry.triggers.includes(t));
    const dateMatch = !filters.dateRange || 
      (entry.date >= filters.dateRange[0] && entry.date <= filters.dateRange[1]);
    
    return moodMatch && stressMatch && emotionMatch && triggerMatch && dateMatch;
  });
}
```

### 2. **Correlation Calculation**
```typescript
// lib/correlations.ts
export function calculateCorrelation(
  arr1: number[],
  arr2: number[]
): number {
  const mean1 = arr1.reduce((a, b) => a + b) / arr1.length;
  const mean2 = arr2.reduce((a, b) => a + b) / arr2.length;
  
  const numerator = arr1.reduce((sum, val, i) => 
    sum + (val - mean1) * (arr2[i] - mean2), 0);
  const denom1 = Math.sqrt(arr1.reduce((sum, val) => 
    sum + Math.pow(val - mean1, 2), 0));
  const denom2 = Math.sqrt(arr2.reduce((sum, val) => 
    sum + Math.pow(val - mean2, 2), 0));
  
  return numerator / (denom1 * denom2);
}
```

### 3. **Insights Engine**
```typescript
// lib/insights.ts
export function generateInsights(entries: IEntry[], period: 'week' | 'month'): IInsight[] {
  const insights: IInsight[] = [];
  
  // Mood trend
  const moodTrend = calculateTrend(entries.map(e => e.mood));
  if (moodTrend > 0.2) {
    insights.push({
      type: 'trend',
      title: 'Mood Improving',
      description: 'Your mood has improved this week'
    });
  }
  
  // Sleep correlation
  const sleepMoodCorr = calculateCorrelation(
    entries.map(e => e.sleep),
    entries.map(e => e.mood)
  );
  if (sleepMoodCorr > 0.5) {
    insights.push({
      type: 'correlation',
      title: 'Sleep Affects Mood',
      description: 'You noticed better mood on nights with more sleep'
    });
  }
  
  // Trigger patterns
  const triggers = analyzeTriggers(entries);
  if (triggers.length > 0) {
    insights.push({
      type: 'pattern',
      title: 'Common Triggers',
      description: `${triggers[0]} appears frequently`
    });
  }
  
  return insights;
}
```

---

## Part 11: Empty States & Onboarding Continuation

Every page should have appropriate empty states:

```typescript
// Example: Journal page empty state
const JournalEmpty = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">No entries yet</h3>
    <p className="text-muted-foreground mb-6">
      Start journaling to track your wellness
    </p>
    <Button onClick={scrollToForm}>Log today's entry</Button>
  </div>
);
```

---

## Part 12: Loading States & Skeletons

Use existing Skeleton component:

```typescript
// Example: Overview page loading
const OverviewLoading = () => (
  <div className="space-y-4">
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-64 w-full" />
    <div className="grid grid-cols-3 gap-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);
```

---

## Part 13: Icon Usage Reference

Never use emojis. Use these Lucide React icons:

| Feature | Icon | Light | Dark |
|---------|------|-------|------|
| Dashboard | Home | ✓ | ✓ |
| Journal | BookOpen | ✓ | ✓ |
| Analytics | BarChart3 | ✓ | ✓ |
| Insights | Lightbulb | ✓ | ✓ |
| AI Assistant | Sparkles | ✓ | ✓ |
| Goals | Target | ✓ | ✓ |
| Reports | FileText | ✓ | ✓ |
| Settings | Settings | ✓ | ✓ |
| User Profile | User | ✓ | ✓ |
| Logout | LogOut | ✓ | ✓ |
| Mood High | Smile | ✓ | ✓ |
| Mood Low | Frown | ✓ | ✓ |
| Mood Neutral | Meh | ✓ | ✓ |
| Stress | AlertTriangle | ✓ | ✓ |
| Sleep | Moon | ✓ | ✓ |
| Search | Search | ✓ | ✓ |
| Filter | SlidersHorizontal | ✓ | ✓ |
| Download | Download | ✓ | ✓ |
| Edit | Edit2 | ✓ | ✓ |
| Delete | Trash2 | ✓ | ✓ |
| Add | Plus | ✓ | ✓ |
| Check | CheckCircle | ✓ | ✓ |
| Warning | AlertCircle | ✓ | ✓ |
| Info | Info | ✓ | ✓ |
| Calendar | Calendar | ✓ | ✓ |
| Chevron | ChevronRight | ✓ | ✓ |
| Menu | Menu | ✓ | ✓ |
| X (close) | X | ✓ | ✓ |

---

## Part 14: Quality Checklist

Before launching each feature:

- [ ] No emojis anywhere in UI or strings
- [ ] All icons from Lucide React
- [ ] Responsive on mobile (< 768px)
- [ ] Loading states show skeletons
- [ ] Empty states are user-friendly
- [ ] Error messages are clear
- [ ] Form validation before submit
- [ ] No hardcoded strings (i18n ready)
- [ ] Accessibility: ARIA labels, keyboard nav
- [ ] Colors contrast meets WCAG AA
- [ ] Theme colors adjust light/dark
- [ ] No custom theme code added
- [ ] Data fetching handles errors
- [ ] 401 redirects to login
- [ ] Sidebar active state correct
- [ ] Mobile hamburger menu works
- [ ] All paths match new structure

---

## Part 15: Success Criteria

The redesigned app will be considered **complete** when:

1. **Sidebar Navigation** is fully functional with all 8 sections
2. **Overview Page** shows meaningful health summary with quick actions
3. **Journal Page** has full CRUD, search, filter, and browsing
4. **Analytics Page** displays interactive charts with correlations
5. **Insights Page** shows computed patterns and recommendations
6. **AI Assistant** provides context-aware responses
7. **Goals & Habits** tracking is functional with progress indicators
8. **Reports** generate weekly/monthly summaries
9. **Settings** are well-organized and functional
10. **Mobile responsive** design works smoothly
11. **No emojis** anywhere
12. **All Lucide icons** used consistently
13. **Theme system** unchanged and working
14. **Auth & middleware** preserved and working
15. **All data persists** correctly to MongoDB
16. **Feels premium** and professional

---

## Summary Table

| Section | Current | New | Status |
|---------|---------|-----|--------|
| Overview | Partial | Full | To Build |
| Journal | Form only | Full explorer | To Build |
| Analytics | Basic | Enhanced | To Enhance |
| Insights | Panel | Full page | To Build |
| AI Chat | Basic | Dedicated page | To Enhance |
| Goals | None | Full tracker | To Build |
| Reports | Export only | Full reports | To Build |
| Settings | Basic | Enhanced | To Refactor |
| Sidebar | None | Full nav | To Build |
| Mobile | Limited | Full drawer nav | To Enhance |

This plan provides a roadmap for transforming your app into a premium mental wellness SaaS product. Start with Phase 1 (Layout) and work through sequentially for best results.
