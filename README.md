# 🧠 Mental Health Analytics Dashboard

A comprehensive, production-ready **Next.js 14** web application designed to help users track, analyze, and improve their mental wellness through daily journaling, visual analytics, and AI-powered insights.

> *"Understanding your patterns is the first step toward meaningful change."*

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Data Models](#-data-models)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

Mental Health Analytics Dashboard empowers users to take control of their emotional well-being by providing:

- **Daily journaling** to capture mood, sleep, stress, and emotional states
- **Visual trend analysis** with interactive charts showing patterns over time
- **Personalized insights** generated from user data
- **AI chat assistant** offering wellness suggestions and guidance
- **Goal tracking** with streak counters to build healthy habits

Whether you're looking to understand your mood triggers, improve sleep quality, or simply become more mindful of your emotional patterns, this application provides the tools you need.

---

## ✨ Features

### 🔐 Secure Authentication
- Email/password registration and login
- JWT-based session management with HTTP-only cookies
- Password hashing with bcrypt
- Protected routes via middleware

### 🎯 Personalized Onboarding
First-time users complete a guided setup to customize their experience:
- Select tracking purposes (mood, sleep, stress, anxiety, mindfulness)
- Set baseline stress levels and typical sleep hours
- Choose personal wellness goals
- Configure dashboard preferences

### 📊 Interactive Dashboard
The heart of the application featuring:
- **Stats Cards** — Quick overview of weekly mood average, sleep average, stress trends, and current streak
- **Mood Chart** — Line/area visualization of mood ratings (1-5) over the past week
- **Sleep Chart** — Bar chart displaying nightly sleep hours
- **Stress Chart** — Trend visualization with directional indicators
- **Insights Panel** — AI-generated observations based on your data

### 📝 Daily Entry Logging
Comprehensive daily check-ins capturing:
| Field | Description |
|-------|-------------|
| **Mood** | Scale of 1-5 with emoji indicators (😢 😕 😐 🙂 😊) |
| **Stress Level** | Scale of 1-10 |
| **Sleep Hours** | Numeric input for hours slept |
| **Emotions** | Multi-select from 12 emotions (Happy, Calm, Anxious, Sad, Angry, Grateful, Excited, Tired, Stressed, Hopeful, Lonely, Content) |
| **Triggers** | Multi-select factors (Work, Family, Health, Finance, Relationships, Social Media, News, Sleep, Weather, Exercise) |
| **Notes** | Free-form journaling space |

### 🤖 AI Chat Assistant
A conversational wellness companion that:
- Answers questions about your mood patterns
- Provides sleep quality insights
- Offers stress management suggestions
- Tracks your overall progress
- Includes quick-reply suggestions for common queries

### ⚙️ Settings & Privacy
- Profile management (name, email)
- Dashboard customization (toggle charts visibility)
- Notification preferences
- **Data Export** — Download all your data as JSON
- **Account Deletion** — Complete data removal with confirmation

### 🌙 Dark/Light Mode
- System-aware theme detection
- Manual toggle for user preference
- Smooth transitions between themes

---

## 🖼️ Screenshots

> *Add screenshots of your application here*

| Dashboard | Entry Form | Chat |
|-----------|------------|------|
| ![Dashboard](screenshots/dashboard.png) | ![Entry](screenshots/entry.png) | ![Chat](screenshots/chat.png) |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Accessible component library |
| **Recharts** | Composable charting library |
| **Lucide React** | Modern icon set |
| **Radix UI** | Headless UI primitives |

### Backend
| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Serverless API endpoints |
| **MongoDB** | NoSQL document database |
| **Mongoose** | MongoDB object modeling |
| **JWT** | Stateless authentication |
| **bcryptjs** | Password hashing |

### Development
| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **PostCSS** | CSS processing |
| **Autoprefixer** | CSS vendor prefixes |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **MongoDB** running locally or a MongoDB Atlas connection string
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mental-health-dashboard.git
   cd mental-health-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/mental-health
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ```

4. **Start MongoDB**
   
   Ensure MongoDB is running locally:
   ```bash
   # Using mongod directly
   mongod --dbpath /path/to/data
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure

```
mental-health-dashboard/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/page.tsx        # Login page
│   │   │   └── signup/page.tsx       # Signup page
│   │   ├── dashboard/                # Main dashboard
│   │   │   ├── page.tsx              # Dashboard page
│   │   │   └── components/           # Dashboard-specific components
│   │   │       ├── StatsCards.tsx    # Metric summary cards
│   │   │       ├── MoodChart.tsx     # Mood trend visualization
│   │   │       ├── SleepChart.tsx    # Sleep bar chart
│   │   │       ├── StressChart.tsx   # Stress trend chart
│   │   │       ├── EntryForm.tsx     # Daily entry modal
│   │   │       └── InsightsPanel.tsx # AI insights display
│   │   ├── chat/page.tsx             # AI chat interface
│   │   ├── settings/page.tsx         # User settings
│   │   ├── onboarding/page.tsx       # New user setup
│   │   ├── api/                      # API route handlers
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── signup/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── me/route.ts
│   │   │   ├── entries/route.ts      # Daily entries CRUD
│   │   │   ├── analytics/route.ts    # Analytics computation
│   │   │   ├── chat/route.ts         # AI chat responses
│   │   │   ├── settings/route.ts     # User preferences
│   │   │   ├── onboarding/route.ts   # Onboarding completion
│   │   │   └── export/route.ts       # Data export
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Landing page
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── theme-provider.tsx        # Dark mode provider
│   │   └── theme-toggle.tsx          # Theme switch button
│   │
│   ├── lib/                          # Utility libraries
│   │   ├── db.ts                     # MongoDB connection
│   │   ├── auth.ts                   # JWT utilities
│   │   ├── analytics.ts              # Analytics computation
│   │   └── utils.ts                  # Helper functions
│   │
│   ├── models/                       # Mongoose schemas
│   │   ├── User.ts                   # User model
│   │   ├── Entry.ts                  # Entry model
│   │   └── Analytics.ts              # Analytics model
│   │
│   ├── types/
│   │   └── index.ts                  # TypeScript interfaces
│   │
│   ├── styles/
│   │   └── globals.css               # Global styles
│   │
│   └── middleware.ts                 # Auth middleware
│
├── public/                           # Static assets
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## 📡 API Reference

### Authentication

| Endpoint | Method | Description | Body |
|----------|--------|-------------|------|
| `/api/auth/signup` | POST | Register new user | `{ email, password, name }` |
| `/api/auth/login` | POST | User login | `{ email, password }` |
| `/api/auth/logout` | POST | User logout | — |
| `/api/auth/me` | GET | Get current user | — |

### Entries

| Endpoint | Method | Description | Body |
|----------|--------|-------------|------|
| `/api/entries` | GET | List user entries | — |
| `/api/entries` | POST | Create new entry | `{ mood, stress, sleep, emotions[], triggers[], notes }` |

### Analytics

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics` | GET | Get computed analytics & chart data |

### Chat

| Endpoint | Method | Description | Body |
|----------|--------|-------------|------|
| `/api/chat` | POST | Send message to AI | `{ message }` |

### Settings

| Endpoint | Method | Description | Body |
|----------|--------|-------------|------|
| `/api/settings` | GET | Get user settings | — |
| `/api/settings` | PUT | Update settings | `{ name, purposes[], dashboardConfig }` |
| `/api/settings` | DELETE | Delete account | — |

### Other

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/onboarding` | POST | Complete onboarding |
| `/api/export` | GET | Export all user data as JSON |

---

## 📊 Data Models

### User
```typescript
{
  _id: ObjectId,
  email: string,              // Unique
  passwordHash: string,
  profile: {
    name: string,
    avatar?: string
  },
  preferences: {
    purposes: string[],       // ["Track mood", "Improve sleep", ...]
    stressBaseline: number,   // 1-10
    sleepHours: number,
    goals: string[],
    notifications: boolean
  },
  dashboardConfig: {
    showMoodChart: boolean,
    showSleepChart: boolean,
    showStressChart: boolean
  },
  onboardingCompleted: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Entry
```typescript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  date: Date,
  mood: number,               // 1-5
  stress: number,             // 1-10
  sleep: number,              // Hours
  emotions: string[],         // ["Happy", "Calm", ...]
  notes: string,
  triggers: string[],         // ["Work", "Health", ...]
  createdAt: Date,
  updatedAt: Date
}
```

### Analytics
```typescript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  period: string,             // "weekly"
  weeklyMoodAvg: number,
  sleepAvg: number,
  stressTrend: number,        // Positive = increasing, negative = decreasing
  streak: number,             // Consecutive days with entries
  insights: string[],         // AI-generated insights
  computedAt: Date
}
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Recharts](https://recharts.org/) for data visualization
- [Lucide](https://lucide.dev/) for the icon set
- [Radix UI](https://www.radix-ui.com/) for accessible primitives

---

<p align="center">
  Made with ❤️ for mental wellness
</p>

