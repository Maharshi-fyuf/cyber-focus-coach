# Database Schema
## Cyber Focus Coach

**Engine:** SQLite 3  
**Driver:** better-sqlite3 (Node.js)  
**File:** `server/data/cfc.db`  
**Last Updated:** 2026-07-20

---

## Design Principles

1. **Simplicity over abstraction** — No ORM. Direct SQL. Readable schema.
2. **Audit trail** — Focus events and session states are append-only logs, never updated.
3. **Single user** — No multi-tenancy. Schema is designed for one user per installation.
4. **Soft deletes** — Nothing is hard-deleted. Completion states use flags.
5. **ISO 8601 timestamps** — All datetimes stored as TEXT in ISO 8601 format (SQLite has no native DATETIME type).

---

## Entity Relationship Diagram

```
users
  │
  ├──< study_sessions
  │         │
  │         ├──< focus_events
  │         └──< session_artifacts
  │
  ├──< daily_logs
  │
  ├──< quiz_attempts
  │         │
  │         └──> quizzes
  │                   │
  │                   └──> roadmap_topics
  │
  ├──< settings
  └──< streaks
```

---

## Tables

### `users`
One record. The single learner.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | TEXT | PRIMARY KEY | UUID v4 |
| name | TEXT | NOT NULL | Display name |
| timezone | TEXT | NOT NULL | e.g. "Asia/Kolkata" |
| daily_target_minutes | INTEGER | NOT NULL DEFAULT 60 | Goal per day |
| created_at | TEXT | NOT NULL | ISO 8601 |
| updated_at | TEXT | NOT NULL | ISO 8601 |

---

### `settings`
One record per user. Configurable thresholds and toggles.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | TEXT | PRIMARY KEY | UUID v4 |
| user_id | TEXT | FK → users.id | |
| camera_enabled | INTEGER | NOT NULL DEFAULT 0 | Boolean (0/1) |
| screen_capture_enabled | INTEGER | NOT NULL DEFAULT 0 | Deferred to V1 |
| focus_threshold | INTEGER | NOT NULL DEFAULT 50 | 0–100 score cutoff |
| idle_threshold_seconds | INTEGER | NOT NULL DEFAULT 30 | Before cursor idle fires |
| grace_period_seconds | INTEGER | NOT NULL DEFAULT 10 | Before auto-pause triggers |
| privacy_mode | INTEGER | NOT NULL DEFAULT 0 | Hides content in UI |
| created_at | TEXT | NOT NULL | ISO 8601 |

---

### `roadmap_topics`
The 30-topic cybersecurity curriculum. Seeded at first launch.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | INTEGER | PRIMARY KEY | Sequential 1–30 |
| title | TEXT | NOT NULL | Topic name |
| description | TEXT | | Short summary |
| category | TEXT | | e.g. "Web Security" |
| sequence_order | INTEGER | NOT NULL UNIQUE | Display order |
| prerequisite_topic_id | INTEGER | FK → roadmap_topics.id, NULLABLE | |
| estimated_days | INTEGER | NOT NULL DEFAULT 2 | Rough time estimate |
| is_locked | INTEGER | NOT NULL DEFAULT 1 | Boolean (0/1) |
| is_completed | INTEGER | NOT NULL DEFAULT 0 | Boolean (0/1) |

---

### `study_sessions`
One record per study session.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | TEXT | PRIMARY KEY | UUID v4 |
| user_id | TEXT | FK → users.id | |
| topic_id | INTEGER | FK → roadmap_topics.id | |
| planned_minutes | INTEGER | NOT NULL | Target session length |
| focused_minutes | INTEGER | NOT NULL DEFAULT 0 | Actual focused time |
| paused_minutes | INTEGER | NOT NULL DEFAULT 0 | Time spent paused |
| session_status | TEXT | NOT NULL | planned/running/paused/completed/aborted |
| start_time | TEXT | NOT NULL | ISO 8601 |
| end_time | TEXT | | ISO 8601 — null until ended |
| focus_score_avg | REAL | | Average confidence score for session |
| pause_reason_last | TEXT | | Last reason for pause |
| created_at | TEXT | NOT NULL | ISO 8601 |

**Indexes:**
- `idx_sessions_user_date` ON `study_sessions(user_id, start_time)`

---

### `focus_events`
Append-only log of every focus signal change. Never updated.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | TEXT | PRIMARY KEY | UUID v4 |
| session_id | TEXT | FK → study_sessions.id | |
| event_type | TEXT | NOT NULL | tab_hidden, face_missing, cursor_idle, resumed, warning, session_start, session_end |
| event_value | TEXT | | Human-readable reason |
| confidence | REAL | | Confidence score at time of event |
| timestamp | TEXT | NOT NULL | ISO 8601 |

**Indexes:**
- `idx_events_session` ON `focus_events(session_id)`

---

### `session_artifacts`
Notes, reflections, and quiz answers attached to a session.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | TEXT | PRIMARY KEY | UUID v4 |
| session_id | TEXT | FK → study_sessions.id | |
| artifact_type | TEXT | NOT NULL | note, reflection, quiz_answer |
| content | TEXT | | Plain text content |
| content_json | TEXT | | JSON content (for structured data) |
| created_at | TEXT | NOT NULL | ISO 8601 |

---

### `daily_logs`
One journal entry per calendar day.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | TEXT | PRIMARY KEY | UUID v4 |
| user_id | TEXT | FK → users.id | |
| log_date | TEXT | NOT NULL | YYYY-MM-DD |
| topic_id | INTEGER | FK → roadmap_topics.id | |
| summary | TEXT | | What was studied |
| wins | TEXT | | What went well |
| blockers | TEXT | | What was difficult |
| next_step | TEXT | | Plan for next session |
| created_at | TEXT | NOT NULL | ISO 8601 |

**Indexes:**
- `idx_logs_user_date` ON `daily_logs(user_id, log_date)`
- UNIQUE constraint on `(user_id, log_date)`

---

### `streaks`
Current and best streak counter. One record per user.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | TEXT | PRIMARY KEY | UUID v4 |
| user_id | TEXT | FK → users.id | |
| current_streak_days | INTEGER | NOT NULL DEFAULT 0 | |
| best_streak_days | INTEGER | NOT NULL DEFAULT 0 | |
| last_active_date | TEXT | | YYYY-MM-DD — last day with a completed session |
| updated_at | TEXT | NOT NULL | ISO 8601 |

---

### `quizzes`
Quiz questions seeded per topic.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | TEXT | PRIMARY KEY | e.g. "q1a" |
| topic_id | INTEGER | FK → roadmap_topics.id | |
| question | TEXT | NOT NULL | |
| option_a | TEXT | NOT NULL | |
| option_b | TEXT | NOT NULL | |
| option_c | TEXT | NOT NULL | |
| option_d | TEXT | NOT NULL | |
| correct_option | INTEGER | NOT NULL | 0-indexed (0=A, 1=B, 2=C, 3=D) |
| explanation | TEXT | NOT NULL | Shown after answer |

**Indexes:**
- `idx_quizzes_topic` ON `quizzes(topic_id)`

---

### `quiz_attempts`
Every quiz attempt recorded. Append-only.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | TEXT | PRIMARY KEY | UUID v4 |
| quiz_id | TEXT | FK → quizzes.id | |
| user_id | TEXT | FK → users.id | |
| selected_option | INTEGER | NOT NULL | 0-indexed |
| is_correct | INTEGER | NOT NULL | Boolean (0/1) |
| attempted_at | TEXT | NOT NULL | ISO 8601 |

**Indexes:**
- `idx_attempts_user` ON `quiz_attempts(user_id)`

---

## SQLite Type System Note

SQLite uses **dynamic typing** with type affinities. Unlike PostgreSQL/MySQL:
- `INTEGER` columns store 64-bit signed integers
- `TEXT` columns store UTF-8 strings
- `REAL` columns store IEEE 754 floating point
- There is no native `BOOLEAN` — we use `INTEGER` with values `0` and `1`
- There is no native `DATETIME` — we use `TEXT` in ISO 8601 format (`2026-07-20T15:30:00.000Z`)

This is standard practice for SQLite and is explicitly recommended in the SQLite documentation.
