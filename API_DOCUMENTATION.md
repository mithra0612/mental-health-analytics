# Mental Health Analytics — API Documentation

**Base URL:** `/api`  
**Auth mechanism:** Session cookie (HTTP-only, set on login/signup)  
**Content-Type:** `application/json` (all requests and responses unless noted)

---

## Table of Contents

1. [Authentication](#1-authentication)
   - [POST /auth/signup](#post-authsignup)
   - [POST /auth/login](#post-authlogin)
   - [POST /auth/logout](#post-authlogout)
   - [GET /auth/me](#get-authme)
2. [Journal Entries](#2-journal-entries)
   - [GET /entries](#get-entries)
   - [POST /entries](#post-entries)
3. [Analytics](#3-analytics)
   - [GET /analytics](#get-analytics)
4. [Goals](#4-goals)
   - [GET /goals](#get-goals)
   - [POST /goals](#post-goals)
   - [PATCH /goals/:id](#patch-goalsid)
   - [DELETE /goals/:id](#delete-goalsid)
5. [Habits](#5-habits)
   - [GET /habits](#get-habits)
   - [POST /habits](#post-habits-toggle)
6. [AI Chat Assistant](#6-ai-chat-assistant)
   - [POST /chat](#post-chat)
7. [Onboarding](#7-onboarding)
   - [POST /onboarding](#post-onboarding)
8. [Settings](#8-settings)
   - [GET /settings](#get-settings)
   - [PUT /settings](#put-settings)
   - [DELETE /settings](#delete-settings)
9. [Export](#9-export)
   - [GET /export](#get-export)
10. [Data Schemas](#10-data-schemas)
11. [Error Responses](#11-error-responses)

---

## 1. Authentication

### POST /auth/signup

Register a new user account.

**Auth required:** No

**Request Body**

| Field      | Type   | Required | Description              |
|------------|--------|----------|--------------------------|
| `name`     | string | Yes      | Display name             |
| `email`    | string | Yes      | Valid email address      |
| `password` | string | Yes      | Account password         |

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Success Response — `200 OK`**

```json
{
  "success": true,
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "onboardingCompleted": false
  }
}
```

A session cookie is set automatically on successful registration.

**Error Responses**

| Status | Condition                              |
|--------|----------------------------------------|
| `400`  | Missing `name`, `email`, or `password` |
| `400`  | Email already in use                   |
| `500`  | Internal server error                  |

---

### POST /auth/login

Authenticate an existing user.

**Auth required:** No

**Request Body**

| Field      | Type   | Required |
|------------|--------|----------|
| `email`    | string | Yes      |
| `password` | string | Yes      |

```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Success Response — `200 OK`**

```json
{
  "success": true,
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "onboardingCompleted": true
  }
}
```

A session cookie is set automatically on success.

**Error Responses**

| Status | Condition                          |
|--------|------------------------------------|
| `400`  | Missing `email` or `password`      |
| `401`  | Invalid email or password          |
| `500`  | Internal server error              |

---

### POST /auth/logout

Invalidate the current session.

**Auth required:** Yes

**Request Body:** None

**Success Response — `200 OK`**

```json
{ "success": true }
```

---

### GET /auth/me

Return the currently authenticated user's profile.

**Auth required:** Yes

**Success Response — `200 OK`**

```json
{
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "onboardingCompleted": true,
    "preferences": {
      "purposes": ["stress", "sleep"],
      "stressBaseline": 5,
      "sleepHours": 8,
      "goals": ["Better sleep", "Reduce anxiety"],
      "notifications": true
    }
  }
}
```

**Error Responses**

| Status | Condition             |
|--------|-----------------------|
| `401`  | Not authenticated     |
| `404`  | User not found        |
| `500`  | Internal server error |

---

## 2. Journal Entries

### GET /entries

Retrieve journal entries for the authenticated user, with optional filtering and pagination.

**Auth required:** Yes

**Query Parameters**

| Parameter   | Type   | Default | Description                                      |
|-------------|--------|---------|--------------------------------------------------|
| `limit`     | number | `30`    | Max number of entries to return                  |
| `offset`    | number | `0`     | Number of entries to skip (for pagination)       |
| `date`      | string | —       | Filter by a single day (`YYYY-MM-DD`)            |
| `startDate` | string | —       | Start of date range (`YYYY-MM-DD`)               |
| `endDate`   | string | —       | End of date range (`YYYY-MM-DD`)                 |

> `date` takes precedence over `startDate`/`endDate` when all three are provided.

**Example Request**

```
GET /api/entries?limit=10&startDate=2026-01-01&endDate=2026-01-31
```

**Success Response — `200 OK`**

```json
{
  "entries": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "date": "2026-01-15T12:00:00.000Z",
      "mood": 4,
      "stress": 3,
      "sleep": 7.5,
      "emotions": ["calm", "focused"],
      "notes": "Productive day overall.",
      "triggers": ["work deadline"],
      "createdAt": "2026-01-15T18:30:00.000Z",
      "updatedAt": "2026-01-15T18:30:00.000Z"
    }
  ],
  "total": 25,
  "hasMore": true
}
```

---

### POST /entries

Create a new journal entry for today, or update the existing entry for the specified date (one entry per day rule).

**Auth required:** Yes

**Request Body**

| Field      | Type     | Required | Constraints       | Description                          |
|------------|----------|----------|-------------------|--------------------------------------|
| `mood`     | number   | Yes      | 1 – 5             | Overall mood rating                  |
| `stress`   | number   | Yes      | 1 – 10            | Stress level                         |
| `sleep`    | number   | Yes      | 0 – 24            | Hours of sleep                       |
| `emotions` | string[] | No       | —                 | List of emotion tags                 |
| `notes`    | string   | No       | —                 | Free-text journal notes              |
| `triggers` | string[] | No       | —                 | List of stress/mood trigger tags     |
| `date`     | string   | No       | `YYYY-MM-DD`      | Date for the entry (defaults to today) |

```json
{
  "mood": 4,
  "stress": 3,
  "sleep": 7.5,
  "emotions": ["calm", "focused"],
  "notes": "Had a productive morning.",
  "triggers": ["work deadline"],
  "date": "2026-03-10"
}
```

**Success Response — `200 OK`** (created or updated entry object)

```json
{
  "entry": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "date": "2026-03-10T12:00:00.000Z",
    "mood": 4,
    "stress": 3,
    "sleep": 7.5,
    "emotions": ["calm", "focused"],
    "notes": "Had a productive morning.",
    "triggers": ["work deadline"],
    "createdAt": "2026-03-10T14:00:00.000Z",
    "updatedAt": "2026-03-10T14:00:00.000Z"
  }
}
```

**Error Responses**

| Status | Condition                               |
|--------|-----------------------------------------|
| `400`  | Missing `mood`, `stress`, or `sleep`    |
| `401`  | Not authenticated                       |
| `500`  | Internal server error                   |

---

## 3. Analytics

### GET /analytics

Compute and return aggregated wellness statistics for the authenticated user.

**Auth required:** Yes

**Query Parameters**

| Parameter | Type   | Default | Allowed Values              | Description             |
|-----------|--------|---------|-----------------------------|-------------------------|
| `period`  | string | `30d`   | `7d`, `30d`, `90d`, `1y`   | Aggregation time window |

**Example Request**

```
GET /api/analytics?period=7d
```

**Success Response — `200 OK`**

```json
{
  "summary": {
    "entriesLogged": 7,
    "moodAverage": 3.86,
    "sleepAverage": 7.14,
    "stressAverage": 4.57
  },
  "period": "7d",
  "dateRange": {
    "start": "2026-03-03T00:00:00.000Z",
    "end": "2026-03-10T23:59:59.999Z"
  },
  "entries": [ /* full entry objects — see Entry schema */ ]
}
```

**Error Responses**

| Status | Condition             |
|--------|-----------------------|
| `401`  | Not authenticated     |
| `500`  | Internal server error |

---

## 4. Goals

### GET /goals

Retrieve all goals for the authenticated user.

**Auth required:** Yes

**Query Parameters**

| Parameter | Type   | Description                                            |
|-----------|--------|--------------------------------------------------------|
| `status`  | string | Filter by status: `active`, `completed`, `archived`   |

**Success Response — `200 OK`**

```json
{
  "goals": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
      "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "title": "Sleep 8 hours daily",
      "description": "Improve sleep quality",
      "type": "habit",
      "targetValue": 30,
      "currentValue": 12,
      "unitOfMeasure": "days",
      "status": "active",
      "startDate": "2026-02-01T00:00:00.000Z",
      "targetDate": "2026-03-31T00:00:00.000Z",
      "frequency": "daily",
      "createdAt": "2026-02-01T10:00:00.000Z",
      "updatedAt": "2026-03-10T09:00:00.000Z"
    }
  ]
}
```

---

### POST /goals

Create a new goal.

**Auth required:** Yes

**Request Body**

| Field           | Type   | Required | Constraints                           | Description                     |
|-----------------|--------|----------|---------------------------------------|---------------------------------|
| `title`         | string | Yes      | —                                     | Goal title                      |
| `targetValue`   | number | Yes      | —                                     | Numeric target to reach         |
| `description`   | string | No       | —                                     | Optional longer description     |
| `type`          | string | No       | `wellness`, `habit`, `custom`         | Goal category (default: `custom`) |
| `unitOfMeasure` | string | No       | —                                     | Unit label (e.g. `days`, `kg`)  |
| `targetDate`    | string | No       | ISO 8601 date string                  | Optional deadline               |
| `frequency`     | string | No       | `daily`, `weekly`, `monthly`          | Recurrence frequency            |

```json
{
  "title": "Meditate regularly",
  "description": "Build a daily meditation habit",
  "type": "habit",
  "targetValue": 30,
  "unitOfMeasure": "days",
  "targetDate": "2026-04-30",
  "frequency": "daily"
}
```

**Success Response — `201 Created`**

```json
{
  "goal": { /* Goal object */ }
}
```

**Error Responses**

| Status | Condition                            |
|--------|--------------------------------------|
| `400`  | Missing `title` or `targetValue`     |
| `401`  | Not authenticated                    |
| `500`  | Internal server error                |

---

### PATCH /goals/:id

Update a goal's progress or status.

**Auth required:** Yes

**URL Parameters**

| Parameter | Description        |
|-----------|--------------------|
| `id`      | Goal MongoDB `_id` |

**Request Body**

| Field          | Type   | Description                                           |
|----------------|--------|-------------------------------------------------------|
| `currentValue` | number | Updated progress value                                |
| `status`       | string | New status: `active`, `completed`, or `archived`     |

> If `currentValue` reaches `targetValue`, `status` is automatically set to `completed`.

```json
{
  "currentValue": 15
}
```

**Success Response — `200 OK`**

```json
{
  "goal": { /* updated Goal object */ }
}
```

**Error Responses**

| Status | Condition                          |
|--------|------------------------------------|
| `401`  | Not authenticated                  |
| `404`  | Goal not found or not owned by user |
| `500`  | Internal server error              |

---

### DELETE /goals/:id

Delete a goal and all associated habit records.

**Auth required:** Yes

**URL Parameters**

| Parameter | Description        |
|-----------|--------------------|
| `id`      | Goal MongoDB `_id` |

**Success Response — `200 OK`**

```json
{ "success": true }
```

**Error Responses**

| Status | Condition                          |
|--------|------------------------------------|
| `401`  | Not authenticated                  |
| `404`  | Goal not found or not owned by user |
| `500`  | Internal server error              |

---

## 5. Habits

### GET /habits

Retrieve habit tracking records for the authenticated user.

**Auth required:** Yes

**Query Parameters**

| Parameter | Type   | Description                       |
|-----------|--------|-----------------------------------|
| `goalId`  | string | Filter habits by linked goal `_id` |

**Success Response — `200 OK`**

```json
{
  "habits": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d4",
      "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "goalId": "64f1a2b3c4d5e6f7a8b9c0d3",
      "completedDates": ["2026-03-09T00:00:00.000Z", "2026-03-10T00:00:00.000Z"],
      "streak": 2,
      "longestStreak": 7,
      "createdAt": "2026-02-01T10:00:00.000Z",
      "updatedAt": "2026-03-10T09:00:00.000Z"
    }
  ]
}
```

---

### POST /habits (Toggle)

Toggle today's completion for a habit linked to a goal. If today is already marked complete, this call removes it (un-toggles). Automatically updates the current streak and goal progress.

**Auth required:** Yes

**Request Body**

| Field    | Type   | Required | Description                        |
|----------|--------|----------|------------------------------------|
| `goalId` | string | Yes      | `_id` of the associated goal       |

```json
{
  "goalId": "64f1a2b3c4d5e6f7a8b9c0d3"
}
```

**Success Response — `200 OK`**

```json
{
  "habit": { /* updated Habit object */ },
  "completedToday": true
}
```

> `completedToday: true` means today was just marked complete; `false` means it was un-marked.

**Error Responses**

| Status | Condition                          |
|--------|------------------------------------|
| `400`  | Missing `goalId`                   |
| `401`  | Not authenticated                  |
| `404`  | Associated goal not found          |
| `500`  | Internal server error              |

---

## 6. AI Chat Assistant

### POST /chat

Send a message to the AI wellness assistant. The assistant receives a system prompt containing the user's recent analytics data and maintains conversational context via the `history` array.

**Auth required:** Yes

**Request Body**

| Field     | Type            | Required | Description                                          |
|-----------|-----------------|----------|------------------------------------------------------|
| `message` | string          | Yes      | The user's message                                   |
| `history` | ChatMessage[]   | No       | Prior conversation turns (up to last 10 are used)   |

`ChatMessage` object:

| Field     | Type             | Description              |
|-----------|------------------|--------------------------|
| `role`    | `user` \| `assistant` | Speaker role        |
| `content` | string           | Message text             |

```json
{
  "message": "I've been feeling stressed lately — any tips?",
  "history": [
    { "role": "user", "content": "Hi!" },
    { "role": "assistant", "content": "Hello! How can I help you today?" }
  ]
}
```

**Success Response — `200 OK`**

```json
{
  "message": "I understand stress can feel overwhelming. Based on your recent data, your stress levels have been above average this week. Here are a few things that might help:\n- Try a 5-minute breathing exercise before bed\n- Consider a short walk during your lunch break\n- Journaling your triggers can help identify patterns"
}
```

**Error Responses**

| Status | Condition                                                             |
|--------|-----------------------------------------------------------------------|
| `400`  | Missing `message`                                                     |
| `401`  | Not authenticated                                                     |
| `503`  | `GROQ_API_KEY` environment variable not configured                   |
| `500`  | Internal server error or upstream AI error                            |

> The assistant uses the **Llama 3.3 70B** model via the Groq API. Responses are capped at 512 tokens.

---

## 7. Onboarding

### POST /onboarding

Save user preferences collected during the onboarding flow and mark onboarding as complete.

**Auth required:** Yes

**Request Body**

| Field            | Type     | Required | Description                                      |
|------------------|----------|----------|--------------------------------------------------|
| `purposes`       | string[] | No       | Why the user is using the app (e.g. `["stress", "sleep"]`) |
| `stressBaseline` | number   | No       | Self-reported baseline stress (default: `5`)     |
| `sleepHours`     | number   | No       | Target sleep hours per night (default: `8`)      |
| `goals`          | string[] | No       | High-level goal descriptions                     |

```json
{
  "purposes": ["stress", "mood"],
  "stressBaseline": 6,
  "sleepHours": 7.5,
  "goals": ["Reduce anxiety", "Sleep better"]
}
```

**Success Response — `200 OK`**

```json
{ "success": true }
```

Session is refreshed with `onboardingCompleted: true`.

**Error Responses**

| Status | Condition             |
|--------|-----------------------|
| `401`  | Not authenticated     |
| `404`  | User not found        |
| `500`  | Internal server error |

---

## 8. Settings

### GET /settings

Retrieve the full user profile (excluding passwordHash).

**Auth required:** Yes

**Success Response — `200 OK`**

```json
{
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "email": "jane@example.com",
    "profile": {
      "name": "Jane Doe",
      "avatar": ""
    },
    "preferences": {
      "purposes": ["stress"],
      "stressBaseline": 5,
      "sleepHours": 8,
      "goals": [],
      "notifications": true
    },
    "dashboardConfig": {
      "showMoodChart": true,
      "showSleepChart": true,
      "showStressChart": true
    },
    "onboardingCompleted": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-03-10T00:00:00.000Z"
  }
}
```

---

### PUT /settings

Update profile information and/or preferences.

**Auth required:** Yes

All fields are optional — only provided fields are updated.

**Request Body**

| Field           | Type     | Description                                         |
|-----------------|----------|-----------------------------------------------------|
| `name`          | string   | New display name                                    |
| `purposes`      | string[] | Updated list of usage purposes                      |
| `notifications` | boolean  | Enable or disable notifications                     |
| `password`      | string   | New password (will be hashed before storing)         |

```json
{
  "name": "Jane Smith",
  "notifications": false
}
```

**Success Response — `200 OK`**

```json
{
  "success": true,
  "user": { /* updated user object, no passwordHash */ }
}
```

**Error Responses**

| Status | Condition             |
|--------|-----------------------|
| `401`  | Not authenticated     |
| `404`  | User not found        |
| `500`  | Internal server error |

---

### DELETE /settings

Permanently delete the account and all associated data (entries, analytics). Clears the session.

**Auth required:** Yes

> **This action is irreversible.**

**Request Body:** None

**Success Response — `200 OK`**

```json
{ "success": true }
```

**Error Responses**

| Status | Condition             |
|--------|-----------------------|
| `401`  | Not authenticated     |
| `500`  | Internal server error |

---

## 9. Export

### GET /export

Download all journal entries as a JSON file.

**Auth required:** Yes

**Success Response — `200 OK`**

Returns a file download with:
- `Content-Type: application/json`
- `Content-Disposition: attachment; filename="mental-health-data-YYYY-MM-DD.json"`

**Response Body (file content)**

```json
{
  "exportDate": "2026-03-10T14:00:00.000Z",
  "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "entries": [
    {
      "date": "2026-03-10T12:00:00.000Z",
      "mood": 4,
      "stress": 3,
      "sleep": 7.5,
      "emotions": ["calm"],
      "notes": "Good day.",
      "triggers": []
    }
  ]
}
```

**Error Responses**

| Status | Condition             |
|--------|-----------------------|
| `401`  | Not authenticated     |
| `500`  | Internal server error |

---

## 10. Data Schemas

### Entry

| Field      | Type     | Constraints | Description               |
|------------|----------|-------------|---------------------------|
| `_id`      | string   | —           | MongoDB ObjectId           |
| `userId`   | string   | required    | Owner user ID             |
| `date`     | Date     | required    | Entry date (noon UTC)     |
| `mood`     | number   | 1–5         | Mood score                |
| `stress`   | number   | 1–10        | Stress level              |
| `sleep`    | number   | 0–24        | Hours of sleep            |
| `emotions` | string[] | —           | Emotion tags              |
| `notes`    | string   | —           | Free-text notes           |
| `triggers` | string[] | —           | Trigger tags              |

### Goal

| Field           | Type   | Constraints                             | Description                 |
|-----------------|--------|-----------------------------------------|-----------------------------|
| `_id`           | string | —                                       | MongoDB ObjectId             |
| `userId`        | string | required                                | Owner user ID               |
| `title`         | string | required                                | Goal title                  |
| `description`   | string | —                                       | Description                 |
| `type`          | string | `wellness`, `habit`, `custom`           | Category                    |
| `targetValue`   | number | required                                | Target numeric value        |
| `currentValue`  | number | default: `0`                            | Current progress            |
| `unitOfMeasure` | string | —                                       | Unit label                  |
| `status`        | string | `active`, `completed`, `archived`       | Goal status                 |
| `startDate`     | Date   | default: now                            | When the goal started       |
| `targetDate`    | Date   | optional                                | Deadline                    |
| `frequency`     | string | `daily`, `weekly`, `monthly`, optional  | Recurrence                  |

### Habit

| Field            | Type   | Description                             |
|------------------|--------|-----------------------------------------|
| `_id`            | string | MongoDB ObjectId                         |
| `userId`         | string | Owner user ID                           |
| `goalId`         | string | Linked goal ID                          |
| `completedDates` | Date[] | Array of dates the habit was completed  |
| `streak`         | number | Current consecutive-day streak          |
| `longestStreak`  | number | All-time best streak                    |

### User Preferences

| Field            | Type     | Default | Description                          |
|------------------|----------|---------|--------------------------------------|
| `purposes`       | string[] | `[]`    | Reasons for using the app            |
| `stressBaseline` | number   | `5`     | Self-reported baseline stress (1–10) |
| `sleepHours`     | number   | `8`     | Target hours of sleep per night      |
| `goals`          | string[] | `[]`    | High-level goal descriptions         |
| `notifications`  | boolean  | `true`  | Notification preference              |

---

## 11. Error Responses

All error responses follow this format:

```json
{
  "error": "Human-readable error message"
}
```

### Common HTTP Status Codes

| Status | Meaning                                            |
|--------|----------------------------------------------------|
| `200`  | Success                                            |
| `201`  | Resource created                                   |
| `400`  | Bad Request — missing or invalid parameters        |
| `401`  | Unauthorized — not logged in or session expired    |
| `404`  | Not Found — resource does not exist                |
| `500`  | Internal Server Error — unexpected server failure  |
| `503`  | Service Unavailable — external dependency missing  |

---

## Notes

- **One entry per day:** `POST /entries` enforces a single entry per calendar day. Submitting a second entry for the same date will update the existing record.
- **Session-based auth:** All protected endpoints require a valid session cookie. Clients should redirect to `/login` on `401` responses.
- **Habit auto-creation:** `POST /habits` creates the habit record automatically on first call if one doesn't exist for the given `goalId`.
- **Goal auto-completion:** Goals are automatically transitioned to `completed` when `currentValue >= targetValue`.
- **Data privacy:** All queries are scoped to the authenticated user's `userId` — cross-user data access is not possible through the API.
