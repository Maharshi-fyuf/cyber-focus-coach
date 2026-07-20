# API Reference
## Cyber Focus Coach

**Base URL (local):** `http://localhost:3001/api`  
**Format:** JSON  
**Authentication:** None (single-user local app)

---

## Session Endpoints

### POST `/session/start`
Begin a new study session.

**Request Body:**
```json
{
  "topic_id": 1,
  "planned_minutes": 60
}
```

**Response:**
```json
{
  "id": "uuid",
  "topic_id": 1,
  "planned_minutes": 60,
  "session_status": "running",
  "start_time": "2026-07-20T15:00:00.000Z"
}
```

---

### POST `/session/pause`
Pause the active session.

**Request Body:**
```json
{
  "reason": "tab_hidden"
}
```

---

### POST `/session/resume`
Resume a paused session.

**Response:** Updated session record.

---

### POST `/session/end`
End the session and save all artifacts.

**Request Body:**
```json
{
  "notes": "Studied SQL injection — UNION attacks and blind injection",
  "reflection": "Need more practice with time-based blind",
  "wins": "Finally understood UNION column count matching",
  "blockers": "Time-based detection is tricky",
  "next_step": "Practice on DVWA tomorrow"
}
```

**Response:**
```json
{
  "session": { "...complete session record..." },
  "streak": { "current": 5, "best": 12 }
}
```

---

### GET `/session/active`
Get the currently active (running or paused) session.

**Response:** Session record or `null`.

---

## Dashboard

### GET `/dashboard/today`
Get all stats needed for the dashboard for today's date.

**Response:**
```json
{
  "date": "2026-07-20",
  "focused_minutes": 45,
  "session_count": 1,
  "daily_target_minutes": 60,
  "target_met": false,
  "topics_completed": 3,
  "streak": { "current": 5, "best": 12 },
  "active_topic": { "...topic record..." }
}
```

---

## Roadmap

### GET `/roadmap`
Get all 30 topics with their current state.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Networking Fundamentals",
    "category": "Foundations",
    "sequence_order": 1,
    "estimated_days": 3,
    "is_locked": false,
    "is_completed": false,
    "description": "..."
  }
]
```

### PATCH `/roadmap/:id/complete`
Mark a topic as completed and unlock the next one.

---

## Logs

### POST `/logs`
Create or update a daily log entry.

**Request Body:**
```json
{
  "log_date": "2026-07-20",
  "topic_id": 6,
  "summary": "Studied SQL injection",
  "wins": "Understood UNION attacks",
  "blockers": "Time-based was confusing",
  "next_step": "Practice on DVWA"
}
```

### GET `/logs/:date`
Get the log entry for a specific date (format: `YYYY-MM-DD`).

### GET `/logs`
Get all log entries, newest first.

---

## Streaks

### GET `/streaks`
Get current and best streak.

**Response:**
```json
{
  "current_streak_days": 5,
  "best_streak_days": 12,
  "last_active_date": "2026-07-20"
}
```

---

## Quizzes

### GET `/quizzes/topic/:id`
Get all quizzes for a topic.

### POST `/quizzes/:id/attempt`
Record a quiz attempt.

**Request Body:**
```json
{
  "selected_option": 2
}
```

**Response:**
```json
{
  "is_correct": true,
  "correct_option": 2,
  "explanation": "ECDHE generates ephemeral key pairs..."
}
```

---

## Focus Events

### POST `/focus-event`
Log a focus signal event (called by the frontend Focus Engine).

**Request Body:**
```json
{
  "session_id": "uuid",
  "event_type": "tab_hidden",
  "event_value": "User switched to another tab",
  "confidence": 20
}
```

---

## Settings

### GET `/settings`
Get user settings.

### PUT `/settings`
Update user settings.

**Request Body (partial update supported):**
```json
{
  "camera_enabled": true,
  "focus_threshold": 50,
  "idle_threshold_seconds": 30,
  "grace_period_seconds": 10
}
```
