# Refactoring & Migration Guide

## Part A: Preserving & Enhancing Current Code

### Current Working Features to Keep As-Is
1. **Authentication system** (`src/lib/auth.ts`)
2. **Middleware protection** (`src/middleware.ts`)
3. **Database connection** (`src/lib/db.ts`)
4. **Theme provider** (`src/components/theme-provider.tsx`)
5. **Theme toggle** (`src/components/theme-toggle.tsx`)
6. **All UI base components** (`src/components/ui/`)
7. **Auth routes** (`src/app/(auth)/`)
8. **Onboarding flow** (`src/app/onboarding/`)

### Existing Code to Refactor/Reuse

#### 1. Move & Enhance EntryForm
**Current location:** `src/app/dashboard/components/EntryForm.tsx`
**New location:** `src/components/dashboard/journal/EntryForm.tsx`

What to change:
```typescript
// OLD: EntryForm was part of dashboard page
// NEW: Make it reusable, add multi-select for emotions/triggers

// Add these props
interface EntryFormProps {
  date?: Date;
  onSuccess?: (entry: IEntry) => void;
  initialData?: Partial<IEntry>;
  isLoading?: boolean;
}

// Enhance emotion selection
const emotionOptions = [
  "Happy", "Calm", "Anxious", "Stressed", "Sad",
  "Angry", "Tired", "Energized", "Hopeful", "Overwhelmed"
];

// Replace single textarea with structured fields
<div className="space-y-4">
  <div>
    <label>Mood (1-5)</label>
    <MoodSelector value={mood} onChange={setMood} />
  </div>
  <div>
    <label>Stress Level (1-10)</label>
    <input type="range" min="1" max="10" value={stress} onChange={...} />
  </div>
  <div>
    <label>Sleep Hours (0-24)</label>
    <input type="number" step="0.5" value={sleep} onChange={...} />
  </div>
  <div>
    <label>Emotions (select all that apply)</label>
    <div className="grid grid-cols-2 gap-2">
      {emotionOptions.map(emotion => (
        <Checkbox
          key={emotion}
          label={emotion}
          checked={emotions.includes(emotion)}
          onChange={() => toggleEmotion(emotion)}
        />
      ))}
    </div>
  </div>
  <div>
    <label>Triggers (add tags)</label>
    <TagInput value={triggers} onChange={setTriggers} />
  </div>
  <div>
    <label>Notes</label>
    <textarea value={notes} onChange={...} />
  </div>
</div>
```

---

#### 2. Refactor Chart Components
**Current locations:**
- `src/app/dashboard/components/MoodChart.tsx`
- `src/app/dashboard/components/StressChart.tsx`
- `src/app/dashboard/components/SleepChart.tsx`

**New locations:**
- Keep in dashboard/components for now
- BUT refactor to accept props for timeframe, data array, etc.

Example refactor:
```typescript
// OLD
<MoodChart /> // Hardcoded to 30 days

// NEW
<MoodChart 
  data={chartData}
  timeframe="7d" 
  height={400}
  showAverage={true}
/>

// Implementation
interface ChartProps {
  data: Array<{ date: string; value: number }>;
  timeframe: "7d" | "30d" | "90d";
  height?: number;
  showAverage?: boolean;
  showTrendline?: boolean;
}

export function MoodChart({
  data,
  timeframe,
  height = 300,
  showAverage = false,
  showTrendline = false
}: ChartProps) {
  const avgValue = data.reduce((sum, d) => sum + d.value, 0) / data.length;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[1, 5]} />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="var(--accent)"
          dot={false}
        />
        {showAverage && (
          <ReferenceLine 
            y={avgValue} 
            stroke="var(--muted-foreground)"
            strokeDasharray="5 5"
            label="Average"
          />
        )}
        {showTrendline && (
          <Line 
            type="monotone" 
            dataKey="trend" 
            stroke="var(--secondary)"
            strokeWidth={2}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

#### 3. Enhance StatsCards
**Current location:** `src/app/dashboard/components/StatsCards.tsx`
**Keep location:** `src/app/dashboard/components/`
**Also create new:** `src/components/dashboard/overview/QuickStatsCards.tsx`

Example enhancement:
```typescript
// OLD: Static card structure

// NEW: Flexible card system
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    direction: "up" | "down" | "neutral";
    percentage: number;
  };
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  onClick
}: StatCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
            {trend && (
              <p className={`text-xs mt-2 ${
                trend.direction === 'up' ? 'text-green-600' :
                trend.direction === 'down' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {trend.direction === 'up' ? '↑' : '↓'} {trend.percentage}%
              </p>
            )}
          </div>
          {icon && (
            <div className="text-accent">{icon}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

#### 4. Extract & Enhance InsightsPanel
**Current location:** `src/app/dashboard/components/InsightsPanel.tsx`
**New location:** `src/components/dashboard/insights/InsightCard.tsx`

Transform from:
```typescript
// OLD: Display existing analytics.insights array

// NEW: Generate real insights from data
interface InsightCardProps {
  type: "trend" | "pattern" | "correlation" | "recommendation";
  title: string;
  description: string;
  icon: React.ReactNode;
  relevance: "high" | "medium" | "low";
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function InsightCard({
  type,
  title,
  description,
  icon,
  relevance,
  action
}: InsightCardProps) {
  const relevanceColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-blue-200 bg-blue-50'
  };

  return (
    <Card className={`border-l-4 ${relevanceColors[relevance]}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="text-accent mt-1">{icon}</div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
            {action && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### API Routes to Enhance

#### 1. Enhance GET /api/entries
```typescript
// OLD: Return all entries for user

// NEW: Add filters and response structure
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Support new query parameters
  const limit = searchParams.get('limit') || '100';
  const skip = searchParams.get('skip') || '0';
  const sort = searchParams.get('sort') || '-date';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const minMood = searchParams.get('minMood');
  const maxStress = searchParams.get('maxStress');

  let query: Record<string, any> = { userId: session.id };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (minMood) query.mood = { $gte: parseInt(minMood) };
  if (maxStress) query.stress = { $lte: parseInt(maxStress) };

  const entries = await Entry.find(query)
    .sort(sort)
    .skip(parseInt(skip))
    .limit(parseInt(limit));

  return NextResponse.json({
    entries,
    total: await Entry.countDocuments(query),
    page: Math.floor(parseInt(skip) / parseInt(limit)) + 1
  });
}
```

#### 2. Enhance GET /api/analytics
```typescript
// OLD: Return basic analytics

// NEW: Return comprehensive dashboard data
export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get('period') || '30d';
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const entries = await Entry.find({
    userId: session.id,
    date: { $gte: startDate }
  });

  // Calculate metrics
  const moods = entries.map(e => e.mood);
  const stresses = entries.map(e => e.stress);
  const sleeps = entries.map(e => e.sleep);

  const analytics = {
    period,
    dateRange: { start: startDate, end: new Date() },
    summary: {
      entriesLogged: entries.length,
      moodAverage: moods.length > 0 ? (moods.reduce((a, b) => a + b) / moods.length).toFixed(2) : 0,
      sleepAverage: sleeps.length > 0 ? (sleeps.reduce((a, b) => a + b) / sleeps.length).toFixed(1) : 0,
      stressAverage: stresses.length > 0 ? (stresses.reduce((a, b) => a + b) / stresses.length).toFixed(1) : 0,
    },
    chartData: entries.map(e => ({
      date: e.date.toISOString().split('T')[0],
      mood: e.mood,
      stress: e.stress,
      sleep: e.sleep,
    })),
    trends: {
      mood: calculateTrend(moods),
      stress: calculateTrend(stresses),
      sleep: calculateTrend(sleeps),
    }
  };

  return NextResponse.json(analytics);
}
```

---

## Part B: Phase-by-Phase Execution Plan

### **Phase 0: Preparation (Day 1)**

#### Step 1: Create New Models
```bash
# Create these files with code from IMPLEMENTATION_GUIDE.md:
# - src/models/Goal.ts
# - src/models/Habit.ts
# - src/models/ChatSession.ts

# Update existing file:
# - src/types/index.ts (add all new interfaces)
```

**Verification:**
- Models compile without errors
- TypeScript types are recognized
- Mongoose connection works

---

#### Step 2: Create Library Functions
```bash
# Create these files with code from IMPLEMENTATION_GUIDE.md:
# - src/lib/insights.ts
# - src/lib/correlations.ts
# - src/lib/validators.ts (create separately for form validation)
# - src/lib/reports.ts (create stub)
# - src/lib/goals.ts (create stub)
# - src/lib/triggers.ts (create stub)
```

**Verification:**
- All functions have JSDoc comments
- TypeScript types are correct
- No console errors on import

---

### **Phase 1: Sidebar & Layout (Day 2)**

#### Step 1: Create Layout Components
```bash
# Create folder structure
mkdir -p src/components/layout

# Create files with code from IMPLEMENTATION_GUIDE.md:
# - src/components/layout/Sidebar.tsx
# - src/components/layout/UserMenu.tsx
# - src/components/layout/DashboardHeader.tsx
```

**Verification:**
- No TypeScript errors
- Sidebar renders without crashing
- Navigation links are clickable

---

#### Step 2: Create Dashboard Layout
```bash
# Create:
# - src/app/dashboard/layout.tsx (with Sidebar wrapper)

# Update:
# - src/app/dashboard/page.tsx (redirect to /overview)
```

**Verification:**
- Sidebar shows on dashboard pages
- Mobile hamburger works
- Theme toggle is accessible
- User menu works

---

#### Step 3: Test Navigation
- Visit `/dashboard` → should see sidebar + redirect
- Visit `/dashboard/settings` → should show in sidebar (even though page doesn't exist yet)
- Click mobile menu → sidebar drawer opens/closes
- Click theme toggle → theme changes

---

### **Phase 2: Overview Page (Day 3)**

#### Step 1: Create Page Structure
```bash
# Create:
# - src/app/dashboard/overview/page.tsx (skeleton)

# Create folder structure:
mkdir -p src/components/dashboard/overview
```

**Code structure:**
```typescript
// src/app/dashboard/overview/page.tsx
export default function OverviewPage() {
  return (
    <div>
      <DashboardHeader title="Overview" />
      <div className="p-6">
        {/* Components go here */}
      </div>
    </div>
  );
}
```

---

#### Step 2: Create Component Stubs
```bash
# Create these files with placeholder components:
# - src/components/dashboard/overview/TodayStatusCard.tsx
# - src/components/dashboard/overview/QuickStatsCards.tsx
# - src/components/dashboard/overview/StreakWidget.tsx
# - src/components/dashboard/overview/RiskIndicators.tsx
# - src/components/dashboard/overview/InsightCards.tsx
# - src/components/dashboard/overview/QuickActionBar.tsx
```

---

#### Step 3: Build Each Component Incrementally
Start with TodayStatusCard:
```typescript
// src/components/dashboard/overview/TodayStatusCard.tsx
import { Card, CardContent } from "@/components/ui/card";

interface TodayStatusCardProps {
  mood?: number;
  stress?: number;
  sleep?: number;
  isLoading?: boolean;
}

export function TodayStatusCard({
  mood,
  stress,
  sleep,
  isLoading
}: TodayStatusCardProps) {
  if (isLoading) return <Card><CardContent className="p-6">Loading...</CardContent></Card>;
  
  if (!mood && !stress && !sleep) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No entry logged today</p>
          <p className="text-sm text-muted-foreground mt-2">
            Start your daily check-in to see your status
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4">Today's Status</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Mood</p>
            <p className="text-2xl font-bold">{mood}/5</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Stress</p>
            <p className="text-2xl font-bold">{stress}/10</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sleep</p>
            <p className="text-2xl font-bold">{sleep}h</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Continue with other components...**

---

#### Step 4: Connect to API
```typescript
// In page.tsx
"use client";

import { useEffect, useState } from "react";
import { TodayStatusCard } from "@/components/dashboard/overview/TodayStatusCard";

export default function OverviewPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        // Fetch today's entry
        const dates = new Date();
        const dateStr = dates.toISOString().split('T')[0];
        
        const res = await fetch(
          `/api/entries?startDate=${dateStr}&endDate=${dateStr}`
        );
        const result = await res.json();
        
        if (result.entries.length > 0) {
          setData(result.entries[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      <DashboardHeader title="Overview" />
      <div className="p-6">
        <TodayStatusCard
          mood={data?.mood}
          stress={data?.stress}
          sleep={data?.sleep}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
```

---

### **Phase 3: Journal Page (Day 4-5)**

#### Step 1: Create Page & Components
```bash
mkdir -p src/components/dashboard/journal

# Create files:
# - src/app/dashboard/journal/page.tsx
# - src/app/dashboard/journal/[date]/page.tsx
# - src/components/dashboard/journal/EntryForm.tsx (refactored)
# - src/components/dashboard/journal/JournalList.tsx
# - src/components/dashboard/journal/EntryCard.tsx
# - src/components/dashboard/journal/JournalFilters.tsx
```

---

#### Step 2: Move & Enhance EntryForm
Copy existing `src/app/dashboard/components/EntryForm.tsx` to `src/components/dashboard/journal/EntryForm.tsx` and enhance with:
- Date picker for past entries
- Multi-select emotions
- Tag input for triggers
- Better validation
- Loading state

---

#### Step 3: Create JournalList Component
Shows entries in a grid/list with filters applied

---

#### Step 4: Create Entry Detail Page (`[date]`)
Shows single entry with edit capability

---

#### Step 5: Implement API Routes
```bash
# Create:
# - src/app/api/journal/route.ts (GET with filters)
# - src/app/api/journal/search/route.ts (POST search)
```

---

### **Phase 4: Continue with Remaining Pages**

**Phase 4:** Analytics Page (Day 6)
**Phase 5:** Insights Page (Day 7)
**Phase 6:** Goals & Habits (Day 8-9)
**Phase 7:** AI Assistant (Day 10)
**Phase 8:** Reports (Day 11)
**Phase 9:** Settings (Day 12)
**Phase 10:** Testing & Polish (Day 13-14)

---

## Part C: Testing Checklist

Before committing each phase:

### Functionality Tests
- [ ] Page loads without errors
- [ ] Data fetches correctly
- [ ] Forms submit successfully
- [ ] Filters/search work
- [ ] Delete/edit operations work
- [ ] No console errors

### UI/UX Tests
- [ ] Sidebar navigation updates active state
- [ ] Loading skeletons show
- [ ] Empty states display properly
- [ ] Error messages are clear
- [ ] Buttons are clickable
- [ ] Forms have proper labels

### Responsive Tests
- [ ] Desktop (1920px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)
- [ ] Mobile menu works
- [ ] No horizontal scrolling

### Browser Tests
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Theme Tests
- [ ] Light mode colors correct
- [ ] Dark mode colors correct
- [ ] System mode follows preference
- [ ] Toggle switches correctly

### Data Tests
- [ ] Data persists after refresh
- [ ] Multiple users don't see each other's data
- [ ] Timezone handling is correct
- [ ] Date ranges work properly

---

## Part D: Common Pitfalls to Avoid

1. **Mixing server and client components**
   - Keep async/auth checks in Server Components
   - Use "use client" only where needed

2. **Not handling loading states**
   - Always show skeleton while fetching
   - Disable buttons during submission

3. **Hardcoding dates**
   - Use timezone-aware date handling
   - Store dates as ISO strings in DB

4. **Forgetting error handling**
   - Check response status codes
   - Redirect on 401
   - Show user-friendly error messages

5. **CSS conflicts**
   - Use Tailwind classes consistently
   - Avoid CSS modules in shadcn components
   - Keep specificity low

6. **Adding emojis anywhere**
   - Search entire codebase for: 🎉 😊 ✅ ❌ 🎯 etc.
   - Use Lucide icons instead
   - Check placeholder text, labels, and state messages

7. **Modifying theme system**
   - Don't change ThemeProvider logic
   - Don't add new theme libraries
   - Don't create custom theme colors
   - Keep theme toggle exactly as is

---

## Part E: Deployment Checklist

Before deploying to production:

- [ ] All TypeScript errors resolved
- [ ] No console.errors or warnings
- [ ] All tests pass
- [ ] Environment variables set
- [ ] Database indexes created
- [ ] Mobile responsive verified
- [ ] Theme switching works
- [ ] No emojis anywhere
- [ ] All Lucide icons used correctly
- [ ] Auth flows tested end-to-end
- [ ] Sensitive data not logged
- [ ] Build succeeds: `npm run build`
- [ ] No 404s in navigation
- [ ] API error handling works
- [ ] Session expiry handled
- [ ] Empty states work
- [ ] Loading states work
- [ ] Print-friendly layouts tested

---

## Part F: Production Monitoring

After deployment, monitor:

1. **Error tracking**
   - Frontend errors
   - API errors
   - Network issues

2. **Performance**
   - Page load times
   - API response times
   - Database query performance

3. **User behavior**
   - Most visited pages
   - Common errors
   - Feature usage

4. **Data integrity**
   - Entries created correctly
   - No data loss
   - Backups working

---

## Summary

This refactoring takes the existing app and:
1. **Preserves** all working authentication and core logic
2. **Enhances** existing components with new props and features
3. **Extends** the database with new models
4. **Reorganizes** code into logical component folders
5. **Adds** new pages and features in a structured way
6. **Maintains** the exact theme system without changes
7. **Ensures** no emojis and only Lucide icons used

The result: A professional, multi-section mental wellness SaaS product built incrementally from the existing foundation.
