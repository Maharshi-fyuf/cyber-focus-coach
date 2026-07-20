# Technical Requirements Document (TRD)
## Cyber Focus Coach

**Version:** 1.0.0  
**Status:** Active Development  
**Last Updated:** 2026-07-20

---

## 1. Assumptions

1. The app runs on localhost in a Chromium-based browser (Chrome, Edge, Brave)
2. The user explicitly grants camera and screen-share permissions — nothing is captured silently
3. The app is always visible in the foreground during an active session
4. The user accepts that focus detection is probabilistic, not perfect
5. All data remains on the local machine unless the user explicitly exports it

---

## 2. Technical Constraints

| Constraint | Details |
|-----------|---------|
| Camera API | `getUserMedia()` requires explicit browser permission. Must handle denial gracefully. |
| Screen capture | `getDisplayMedia()` requires explicit permission and may have OS-level restrictions. Deferred to V1. |
| Tab visibility | Detected via `document.visibilityState` + `visibilitychange` event |
| Cursor idle | Detected via `mousemove`, `keydown`, `click`, `scroll` event listeners |
| Browser storage | SQLite via backend API. Frontend state is ephemeral (React + Zustand). |
| Offline first | All APIs are local (localhost). No external network calls during session. |

---

## 3. Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI component framework |
| TypeScript | 5.x | Type safety, IDE support, fewer runtime bugs |
| Vite | 5.x | Dev server, bundler (fast, modern) |
| Zustand | 4.x | Lightweight client-side state management |
| React Router | 6.x | Client-side navigation |

> **Why TypeScript?** The PRD mentions this is "one of the biggest projects" the user has ever built. TypeScript catches bugs at compile time that vanilla JS only shows at runtime. For a project of this complexity (focus engine, session state machine, async DB), the type safety is essential — not optional.

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 22.x LTS | JavaScript runtime |
| Express | 4.x | HTTP API server |
| better-sqlite3 | 9.x | SQLite driver (synchronous, no async overhead) |
| cors | 2.x | Allows frontend on :5173 to call backend on :3001 |

> **Why Express over FastAPI?** Both are valid. Express was chosen to keep the entire stack in one language (TypeScript/JavaScript). This reduces cognitive overhead and means one ecosystem for debugging, tooling, and hiring. FastAPI would require Python context-switching.

> **Why better-sqlite3 over an ORM?** For a single-user local app, the simplicity of direct SQL queries is a feature, not a limitation. ORMs add abstraction and complexity that we'd spend time learning instead of building. We write SQL directly — which also teaches you valuable database skills.

### Infrastructure
| Component | Details |
|----------|---------|
| Database | SQLite file: `server/data/cfc.db` |
| Dev servers | Frontend: localhost:5173, Backend: localhost:3001 |
| Process manager | `concurrently` (runs both servers with one `npm run dev` command) |

---

## 4. Focus Detection Architecture

### Signal Sources

| Signal | API Used | Weight | Default |
|--------|---------|--------|---------|
| Tab visible | `document.visibilityState` | +20 | Enabled |
| Cursor active | `mousemove` / `pointermove` events | +15 | Enabled |
| Face present | `getUserMedia` + pixel analysis | +40 | Optional |
| Face forward | Camera frame analysis | +25 | Optional |

### Penalty Conditions

| Condition | Penalty |
|-----------|---------|
| Tab hidden | -50 |
| Face missing (when camera enabled) | -40 |
| Cursor idle > threshold | -30 |

### Confidence Formula

```
confidence = base_signals + bonus_signals - penalties
confidence = clamp(confidence, 0, 100)
```

### State Machine

```
IDLE → RUNNING (on session start)
RUNNING → PAUSED (confidence < threshold for > grace_period)
RUNNING → PAUSED (user manual pause)
PAUSED → RUNNING (confidence >= threshold, auto-resume)
PAUSED → RUNNING (user manual resume)
RUNNING → ENDED (user ends session, or target duration reached)
PAUSED → ENDED (user ends from paused state)
```

### Sampling Rate
- Signals evaluated every **1 second**
- Grace period: **10 seconds** below threshold before auto-pause (configurable)

---

## 5. API Design

### Base URL
`http://localhost:3001/api`

### Session Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/session/start` | Begin a new session |
| POST | `/session/pause` | Pause active session |
| POST | `/session/resume` | Resume paused session |
| POST | `/session/end` | End session, save artifacts |
| GET | `/session/active` | Get current active session |

### Data Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/dashboard/today` | Today's stats and progress |
| GET | `/roadmap` | All topics with locked/unlocked state |
| PATCH | `/roadmap/:id/complete` | Mark topic complete |
| POST | `/logs` | Create daily log entry |
| GET | `/logs/:date` | Get log for specific date |
| GET | `/logs` | Get all logs (paginated) |
| GET | `/streaks` | Current and best streak |
| GET | `/quizzes/topic/:id` | Get quizzes for a topic |
| POST | `/quizzes/:id/attempt` | Record a quiz attempt |
| POST | `/focus-event` | Log a focus signal event |
| GET | `/settings` | Get user settings |
| PUT | `/settings` | Update user settings |

---

## 6. Database Schema Overview

See `docs/DATABASE_SCHEMA.md` for full column definitions.

### Entity Summary

```
users              ← Single user record
roadmap_topics     ← 30 ordered cybersecurity topics
study_sessions     ← One record per study session
focus_events       ← One record per focus signal change
session_artifacts  ← Notes, reflections, quiz answers
daily_logs         ← One journal entry per day
streaks            ← Current and best streak counter
quizzes            ← Quiz questions per topic
quiz_attempts      ← User's answers and correctness
settings           ← User preferences and thresholds
```

---

## 7. Security and Privacy

| Principle | Implementation |
|-----------|---------------|
| No covert capture | Camera and screen share require explicit permission. Prompted clearly. |
| No frame storage | Face detection runs on live frames. No images are written to disk. |
| No network calls | All APIs are localhost. No data leaves the machine. |
| Explicit consent | Onboarding explains every signal before requesting permission. |
| User control | All signals can be disabled in Settings. |
| Data export | User can export all data as JSON at any time. |
| Data deletion | User can reset/clear all data from Settings. |

---

## 8. Performance Requirements

| Metric | Target |
|--------|--------|
| App initial load | < 2 seconds on localhost |
| API response time | < 50ms for all local DB queries |
| Focus engine overhead | < 5% CPU on idle |
| Camera face detection | Non-blocking, runs off main thread where possible |
| Database file size | < 10MB after 1 year of daily use |

---

## 9. Browser Compatibility

| Browser | Support Level |
|---------|--------------|
| Chrome 120+ | ✅ Full support |
| Edge 120+ | ✅ Full support |
| Brave | ✅ Full support |
| Firefox | ⚠️ getUserMedia works, some APIs may differ |
| Safari | ❌ Not supported (getDisplayMedia limitations) |
