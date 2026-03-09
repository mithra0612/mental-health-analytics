# Quick Reference Implementation Checklist

## Files to Create (In Order)

### Priority 1: Models & Types (Required First)
- [ ] `src/models/Goal.ts`
- [ ] `src/models/Habit.ts`
- [ ] `src/models/ChatSession.ts`
- [ ] Update `src/types/index.ts` with new interfaces

### Priority 2: Library Functions (Required Early)
- [ ] `src/lib/insights.ts` - Insight generation logic
- [ ] `src/lib/correlations.ts` - Correlation calculations
- [ ] `src/lib/reports.ts` - Report generation (scaffold)
- [ ] `src/lib/goals.ts` - Goal logic (scaffold)
- [ ] `src/lib/triggers.ts` - Trigger analysis (scaffold)
- [ ] `src/lib/validators.ts` - Form validation helpers

### Priority 3: Layout Components (Required for All Pages)
- [ ] `src/components/layout/Sidebar.tsx` - Main navigation
- [ ] `src/components/layout/UserMenu.tsx` - User dropdown
- [ ] `src/components/layout/DashboardHeader.tsx` - Page header
- [ ] `src/components/layout/MobileNav.tsx` - Mobile drawer (optional)
- [ ] `src/app/dashboard/layout.tsx` - Dashboard wrapper

### Priority 4: Page Structure (One at a Time)

#### Round 1: Overview
- [ ] `src/app/dashboard/overview/page.tsx` - Page
- [ ] `src/components/dashboard/overview/TodayStatusCard.tsx`
- [ ] `src/components/dashboard/overview/QuickStatsCards.tsx`
- [ ] `src/components/dashboard/overview/StreakWidget.tsx`
- [ ] `src/components/dashboard/overview/RiskIndicators.tsx`
- [ ] `src/components/dashboard/overview/InsightCards.tsx`
- [ ] `src/components/dashboard/overview/QuickActionBar.tsx`
- [ ] `src/app/api/analytics/route.ts` - Enhanced GET

#### Round 2: Journal
- [ ] `src/app/dashboard/journal/page.tsx` - List page
- [ ] `src/app/dashboard/journal/[date]/page.tsx` - Detail page
- [ ] `src/components/dashboard/journal/EntryForm.tsx` - Refactored from dashboard
- [ ] `src/components/dashboard/journal/JournalList.tsx`
- [ ] `src/components/dashboard/journal/EntryCard.tsx`
- [ ] `src/components/dashboard/journal/JournalFilters.tsx`
- [ ] `src/components/dashboard/journal/EntrySearch.tsx`
- [ ] `src/components/dashboard/journal/DatePicker.tsx`
- [ ] `src/app/api/journal/route.ts` - GET with filters
- [ ] `src/app/api/journal/search/route.ts` - Search POST

#### Round 3: Analytics
- [ ] `src/app/dashboard/analytics/page.tsx`
- [ ] `src/components/dashboard/analytics/TimeframeSelector.tsx`
- [ ] `src/components/dashboard/analytics/MoodTrendChart.tsx`
- [ ] `src/components/dashboard/analytics/StressTrendChart.tsx`
- [ ] `src/components/dashboard/analytics/SleepTrendChart.tsx`
- [ ] `src/components/dashboard/analytics/EmotionDistribution.tsx`
- [ ] `src/components/dashboard/analytics/TriggerPatternChart.tsx`
- [ ] `src/components/dashboard/analytics/HabitConsistency.tsx`
- [ ] `src/components/dashboard/analytics/StreakBreakdown.tsx`
- [ ] `src/components/dashboard/analytics/CorrelationCards.tsx`

#### Round 4: Insights
- [ ] `src/app/dashboard/insights/page.tsx`
- [ ] `src/components/dashboard/insights/InsightCard.tsx`
- [ ] `src/components/dashboard/insights/PatternSummary.tsx`
- [ ] `src/components/dashboard/insights/RiskIndicators.tsx`
- [ ] `src/components/dashboard/insights/WeeklySummary.tsx`
- [ ] `src/components/dashboard/insights/SuggestedActions.tsx`
- [ ] `src/components/dashboard/insights/PositiveReinforcement.tsx`
- [ ] `src/app/api/insights/route.ts`

#### Round 5: AI Assistant
- [ ] `src/app/dashboard/assistant/page.tsx`
- [ ] `src/components/dashboard/assistant/ChatInterface.tsx`
- [ ] `src/components/dashboard/assistant/ChatMessage.tsx`
- [ ] `src/components/dashboard/assistant/MessageInput.tsx`
- [ ] `src/components/dashboard/assistant/PromptSuggestions.tsx`
- [ ] `src/components/dashboard/assistant/SessionHistory.tsx` (optional)
- [ ] Enhance `src/app/api/chat/route.ts`

#### Round 6: Goals & Habits
- [ ] `src/app/dashboard/goals/page.tsx`
- [ ] `src/app/dashboard/goals/[id]/page.tsx`
- [ ] `src/components/dashboard/goals/GoalsList.tsx`
- [ ] `src/components/dashboard/goals/GoalCard.tsx`
- [ ] `src/components/dashboard/goals/GoalForm.tsx`
- [ ] `src/components/dashboard/goals/HabitTracker.tsx`
- [ ] `src/components/dashboard/goals/ProgressIndicators.tsx`
- [ ] `src/components/dashboard/goals/SuggestedGoals.tsx`
- [ ] `src/app/api/goals/route.ts` - CRUD
- [ ] `src/app/api/habits/route.ts` - CRUD

#### Round 7: Reports
- [ ] `src/app/dashboard/reports/page.tsx`
- [ ] `src/app/dashboard/reports/weekly/page.tsx`
- [ ] `src/app/dashboard/reports/monthly/page.tsx`
- [ ] `src/components/dashboard/reports/ReportSelector.tsx`
- [ ] `src/components/dashboard/reports/WeeklyReport.tsx`
- [ ] `src/components/dashboard/reports/MonthlyReport.tsx`
- [ ] `src/components/dashboard/reports/ReportCard.tsx`
- [ ] `src/components/dashboard/reports/ReportStats.tsx`
- [ ] `src/components/dashboard/reports/ExportOptions.tsx`
- [ ] `src/app/api/reports/weekly/route.ts`
- [ ] `src/app/api/reports/monthly/route.ts`

#### Round 8: Settings
- [ ] Refactor `src/app/dashboard/settings/page.tsx`
- [ ] `src/components/dashboard/settings/ProfileSection.tsx`
- [ ] `src/components/dashboard/settings/TrackingSetup.tsx`
- [ ] `src/components/dashboard/settings/NotificationSettings.tsx`
- [ ] `src/components/dashboard/settings/PrivacySettings.tsx`
- [ ] `src/components/dashboard/settings/SecuritySettings.tsx`
- [ ] `src/app/api/settings/route.ts` - Update user preferences

---

## Files to Update (Not Create)

### Keep As-Is (No Changes)
- [ ] `src/components/theme-provider.tsx` - **DO NOT MODIFY**
- [ ] `src/components/theme-toggle.tsx` - **DO NOT MODIFY**
- [ ] `src/lib/auth.ts` - Keep but ensure still works
- [ ] `src/middleware.ts` - Keep protection logic
- [ ] `src/app/(auth)/` - Keep auth routes

### Refactor & Reuse
- [ ] `src/app/dashboard/components/MoodChart.tsx` - Add props for reusability
- [ ] `src/app/dashboard/components/StressChart.tsx` - Add props for reusability
- [ ] `src/app/dashboard/components/SleepChart.tsx` - Add props for reusability
- [ ] `src/app/dashboard/components/StatsCards.tsx` - Make flexible
- [ ] `src/app/dashboard/components/InsightsPanel.tsx` - Move to insights page
- [ ] `src/app/dashboard/components/EntryForm.tsx` - Move to journal folder
- [ ] `src/app/dashboard/page.tsx` - Redirect to `/overview` or remove

### API Routes to Enhance
- [ ] `src/app/api/entries/route.ts` - Add filters and pagination
- [ ] `src/app/api/analytics/route.ts` - Add detailed metrics
- [ ] `src/app/api/chat/route.ts` - Add context from entries
- [ ] `src/app/api/auth/me/route.ts` - Keep as-is
- [ ] `src/app/api/export/route.ts` - Keep enhanced

---

## Component Dependency Map

```
Sidebar
├── SidebarNav (nav links)
├── UserMenu (profile dropdown)
├── ThemeToggle (theme switcher)
└── DashboardHeader (page title)

Overview Page
├── DashboardHeader
├── QuickActionBar (buttons)
├── TodayStatusCard
├── QuickStatsCards
├── StreakWidget
├── RiskIndicators
├── InsightCards
└── ActivityTimeline

Journal Page
├── DashboardHeader
├── QuickActionBar
├── DatePicker or Calendar
├── EntryForm
├── JournalFilters
├── EntrySearch
└── JournalList
    └── EntryCard
        └── EntryDetail (modal/drawer)

Analytics Page
├── DashboardHeader
├── TimeframeSelector
├── MoodTrendChart
├── StressTrendChart
├── SleepTrendChart
├── EmotionDistribution
├── TriggerPatternChart
├── HabitConsistency
├── StreakBreakdown
└── CorrelationCards

Insights Page
├── DashboardHeader
├── InsightCards (type: trend, pattern, correlation, recommendation)
├── PatternSummary
├── RiskIndicators
├── WeeklySummary
├── SuggestedActions
└── PositiveReinforcement

Assistant Page
├── DashboardHeader
├── ChatInterface
│   ├── ChatMessage
│   ├── MessageInput
│   └── SessionHistory (optional)
└── PromptSuggestions (when empty)

Goals Page
├── DashboardHeader
├── QuickActionBar (Add Goal button)
├── GoalsList
│   └── GoalCard
├── HabitTracker
├── ProgressIndicators
└── SuggestedGoals

Reports Page
├── DashboardHeader
├── ReportSelector (tabs: weekly, monthly)
├── ReportStats (cards summary)
└── ExportOptions (PDF, CSV, JSON)

Settings Page
├── DashboardHeader
├── SettingsTabs
├── ProfileSection
├── TrackingSetup
├── NotificationSettings
├── PrivacySettings
└── SecuritySettings
```

---

## API Route Dependencies

```
Core Data:
- GET /api/entries (list with filters)
- GET /api/entries/[id] (detail)
- POST /api/entries (create/update today)
- PUT /api/entries/[id] (update)
- DELETE /api/entries/[id] (delete)

Journal:
- GET /api/journal (list with date range)
- POST /api/journal/search (search notes)

User:
- GET /api/auth/me (current user)
- PUT /api/auth/profile (update name/avatar)
- POST /api/auth/password (change password)

Analytics:
- GET /api/analytics (summary stats)
- GET /api/analytics/trends (detailed trends)
- GET /api/analytics/correlations (sleep/mood/stress)

Insights:
- GET /api/insights (weekly/monthly insights)
- GET /api/insights/patterns (trigger/emotion analysis)
- GET /api/insights/recommendations (personalized)

Goals & Habits:
- GET /api/goals (list)
- POST /api/goals (create)
- PUT /api/goals/[id] (update)
- DELETE /api/goals/[id] (delete)
- POST /api/habits/[id]/complete (mark complete)
- GET /api/habits/consistency (percentage)

Reports:
- GET /api/reports/weekly (weekly report)
- GET /api/reports/monthly (monthly report)
- GET /api/reports/export (download)

Chat:
- POST /api/chat (send message)
- GET /api/chat/sessions (list)
- GET /api/chat/[sessionId] (load history)

Settings:
- PUT /api/settings/preferences (update user prefs)
- PUT /api/settings/notifications (notification prefs)
- POST /api/settings/export (data export)
- POST /api/settings/delete (account deletion)
```

---

## Daily Standup Template

Use this to track progress:

```
Day X: [Component/Page Name]

Completed Today:
- [ ] Component A
- [ ] Component B
- [ ] API Route X

Not Started:
- Components for tomorrow

Blockers:
- [List any issues]

Tests Needed:
- [List test scenarios]
```

---

## Icon Reference for Quick Copy-Paste

```typescript
import {
  Home,          // Overview
  BookOpen,      // Journal
  BarChart3,     // Analytics
  Lightbulb,     // Insights
  Sparkles,      // AI Assistant
  Target,        // Goals
  FileText,      // Reports
  Settings,      // Settings
  User,          // User Profile
  LogOut,        // Logout
  Menu,          // Mobile menu
  X,             // Close
  Plus,          // Add
  Edit2,         // Edit
  Trash2,        // Delete
  Search,        // Search
  SlidersHorizontal, // Filter
  Download,      // Download
  Calendar,      // Calendar
  Clock,         // Time
  ChevronRight,  // Chevron
  AlertTriangle, // Stress/Alert
  AlertCircle,   // Warning
  CheckCircle,   // Complete
  Circle,        // Uncomplete
  TrendingUp,    // Positive trend
  TrendingDown,  // Negative trend
  Smile,         // Good mood
  Frown,         // Bad mood
  Meh,           // Neutral mood
  Moon,          // Sleep
  ZapOff,        // Low energy
  Zap,           // High energy
  MessageCircle, // Chat
  MessageSquare, // Messages
  Eye,           // View
  EyeOff,        // Hide
} from "lucide-react";
```

---

## Mobile Breakpoints

```css
/* Mobile First */
mobile: 0px
sm: 640px
md: 768px  /* Main breakpoint for sidebar show/hide */
lg: 1024px
xl: 1280px
2xl: 1536px

/* Usage:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Responsive grid
</div>
*/
```

---

## Lucide Icon Color Classes

All icons use the color:
```typescript
// Active/Primary
<Icon className="text-accent" />

// Muted/Secondary
<Icon className="text-muted-foreground" />

// Positive
<Icon className="text-green-600 dark:text-green-400" />

// Negative
<Icon className="text-red-600 dark:text-red-400" />

// Warning
<Icon className="text-yellow-600 dark:text-yellow-400" />
```

---

## Common Error Messages (No Emojis)

```typescript
// Success
"Entry saved successfully"
"Changes updated"
"Data exported"

// Error
"Failed to load data. Please try again."
"Invalid input. Please check the form."
"You need to log in again."

// Warning
"Date in the past cannot be changed"
"This action cannot be undone"
"Your session is expiring soon"

// Info
"No entries yet"
"Loading your data..."
"Analyzing your patterns..."
```

---

## Performance Targets

- [ ] Sidebar toggle: < 200ms
- [ ] Page load: < 2 seconds
- [ ] API response: < 1 second
- [ ] Chart render: < 500ms
- [ ] Search results: < 500ms
- [ ] Form submit: < 2 seconds

---

## Accessibility Checklist

For each component:
- [ ] `aria-label` on icon buttons
- [ ] `aria-expanded` on dropdowns
- [ ] `role` attributes where needed
- [ ] Keyboard navigation works
- [ ] Tab order makes sense
- [ ] Contrast ratio ≥ 4.5:1
- [ ] Focus visible on all interactive elements

---

## This Guide Should Answer

**"What file do I build next?"**
→ Check the Priority lists in order

**"What components do I need for this page?"**
→ Check the Component Dependency Map

**"What API routes do I need?"**
→ Check the API Route Dependencies

**"What data should this component receive?"**
→ Check the Implementation Guide code examples

**"What icons should I use?"**
→ Check the Icon Reference list

**"Is there a code example for this?"**
→ Check IMPLEMENTATION_GUIDE.md

**"How do I structure the folder?"**
→ Check the folder structure in REDESIGN_PLAN.md

**"What's the testing checklist?"**
→ Check REFACTORING_GUIDE.md Part C

Good luck! Start with Priority 1, then 2, then 3, then work through Priority 4 in order.
