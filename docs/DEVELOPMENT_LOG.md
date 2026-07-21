# Development Log
## Cyber Focus Coach

Every milestone is recorded here chronologically.  
This is the project's engineering diary.

---

## 2026-07-20 — Session 01: Repository Foundation

### Milestone: ENV-01 — Environment Validation & Repository Setup

**Status:** ✅ Complete (Phase 0)  
**Duration:** ~30 minutes  
**Difficulty:** 1/5

---

### Environment Findings

| Tool | Status | Action |
|------|--------|--------|
| Git | ✅ v2.55.0 | None — ready |
| Node.js | ❌ Missing | **BLOCKED — user must install Node.js LTS** |
| npm / npx | ❌ Missing | Comes with Node.js |
| Python | ⚠️ Broken | Installed (3.13 + 3.15) but `python.exe` missing from PATH |
| SQLite CLI | ❌ Missing | Low priority — bundled via better-sqlite3 |
| VS Code | ✅ v1.129.1 | None — ready |

**Python Root Cause:**  
Python 3.13 install in `AppData\Local\Programs\Python\Python313` is missing `python.exe` — only DLLs and Scripts are present. Python 3.15 is an experimental free-threaded build with a non-standard executable name (`python3.15t.exe`) and the py launcher's pointer to it is broken. Both paths are on PATH but neither resolves to a working `python` command.

---

### Files Created

| File | Purpose |
|------|---------|
| `.gitignore` | Prevents node_modules, .env, .db files from being committed |
| `docs/PRD.md` | Product Requirements Document |
| `docs/TRD.md` | Technical Requirements Document |
| `docs/ARCHITECTURE.md` | System architecture overview + component status |
| `docs/DATABASE_SCHEMA.md` | Full SQLite schema with all 10 tables |
| `docs/DECISIONS.md` | Decision log — 6 decisions recorded |
| `docs/DEVELOPMENT_LOG.md` | This file |
| `docs/BUG_LOG.md` | Bug tracking (initialized) |
| `docs/POSTMORTEMS.md` | Postmortems (initialized) |
| `docs/CHANGELOG.md` | Version changelog (initialized) |
| `docs/API.md` | API documentation (initialized) |
| `docs/ROADMAP.md` | Feature roadmap (initialized) |
| `docs/SETUP.md` | Developer setup guide |
| `docs/CONTRIBUTING.md` | Contribution guidelines |
| `docs/GLOSSARY.md` | Domain-specific terms |
| `docs/APP_FLOW.md` | User flow diagrams |
| `docs/IMPLEMENTATION_PLAN.md` | Milestone breakdown |

---

### Concepts Covered

**Why Git before code?**  
A Git repository is the foundation of professional software. Every decision, every bug, every refactor is recorded in history. Without Git, you have no ability to undo changes safely, no history to reference, and no way to collaborate. We initialize it first — not last.

**Why documentation before code?**  
Documentation written before code forces you to think through the design before committing to an implementation. It catches contradictions, unclear requirements, and missing details before they become expensive bugs. The docs we wrote today will save hours of debugging and rework later.

**Why the previous session's approach was wrong:**  
When Node.js was absent, the correct response is to document the blocker and wait for the dependency — not to redesign the architecture. Silently switching to vanilla HTML because a runtime is missing teaches the wrong lesson and produces the wrong artifact.

---

### Problems Encountered

None at this phase. Environment validation was clean. All findings documented.

---

### Decisions Made

1. **DEC-006**: Archive previous vanilla HTML code — do not extend it
2. **DEC-001 through DEC-005**: Confirmed and documented in DECISIONS.md

---

### Next Steps

- Proceed with **Milestone 01: Project Scaffold (Monorepo Setup)**

---

## 2026-07-20 — Session 02: Node.js Verified & Milestone 01 Initialization

### Milestone: ENV-01 (Re-validation) & M-01 Initiation

**Status:** ✅ Unblocked  
**Duration:** ~10 minutes  

### Updated Environment Status

| Tool | Version / Status | Action |
|------|-----------------|--------|
| Git | ✅ v2.55.0 | Ready |
| Node.js | ✅ v24.18.0 | Verified working |
| npm | ✅ v11.16.0 | Verified working |
| npx | ✅ v11.16.0 | Verified working |
| Python | ⚠️ Broken (`BUG-001`) | Non-blocking for Milestone 1; logged for later resolution |

### Actions Taken
1. Re-validated environment (Node v24.18.0, npm v11.16.0, npx v11.16.0, Git v2.55.0).
2. Logged Python `py` launcher issue (`BUG-001`) as non-blocking in `docs/BUG_LOG.md` and `docs/SETUP.md`.
3. Prepared `implementation_plan.md` for **Milestone 01: Monorepo Setup**.

---

### Milestone: 01 — Monorepo Setup

**Status:** ✅ Complete  
**Duration:** ~25 minutes  
**Difficulty:** 2/5  

### Accomplishments
- Created root `package.json` with npm workspaces (`client`, `server`, `shared`) and dev scripts (`npm run dev`, `build`, `typecheck`).
- Created `shared/` package containing TypeScript domain definitions for User, Settings, RoadmapTopic, StudySession, FocusEvent, DailyLog, Quiz, QuizAttempt, Streak, and HealthResponse.
- Created `client/` workspace with React 19 + Vite + TypeScript, dark cyberpunk design tokens in `index.css`, Lucide icons, and API proxy (`/api` -> `http://localhost:3001`).
- Created `server/` workspace with Express + TypeScript, dotenv, CORS, and `/api/health` diagnostic route.
- Verified TypeScript compilation across all workspaces (`npm run typecheck` returned 0 errors).
- Verified backend server execution and `/api/health` endpoint returning active status (`{"status":"ok", ...}`).

### Next Steps
- Begin **Milestone 03: Backend API — Session Routes**
  - Implement POST /api/session/start
  - Implement POST /api/session/pause
  - Implement POST /api/session/resume
  - Implement POST /api/session/end

---

## 2026-07-20 — Session 03: Database Foundation

### Milestone: 02 — Database Foundation

**Status:** ✅ Complete  
**Duration:** ~25 minutes  
**Difficulty:** 2/5  

### Accomplishments
- Swapped `better-sqlite3` for `@libsql/client` (due to missing Python node-gyp build environment on Windows).
- Implemented `server/src/db/schema.sql` translating the 10 domain entities from `DATABASE_SCHEMA.md` into raw SQLite tables with foreign key constraints and `ON DELETE CASCADE`.
- Implemented `server/src/db/seed.sql` with a default user, default settings, and the 30-topic cybersecurity roadmap.
- Created `server/src/db/database.ts` as a connection singleton establishing a local file connection to `data/cfc.db`.
- Created `server/scripts/setup-db.ts` to automatically enforce WAL mode, enable foreign keys, and run schema/seed files sequentially.
- Verified database creation: `npm run db:setup` successfully generated `cfc.db` and inserted 1 user and 30 roadmap topics.

### Next Steps
- **Milestone 04: Backend API — Data Routes**

---

## 2026-07-20 — Session 04: Backend API - Session Routes

### Milestone: 03 — Backend API (Session Routes)

**Status:** ✅ Complete  
**Duration:** ~25 minutes  
**Difficulty:** 3/5  

### Accomplishments
- Implemented `server/src/controllers/session.controller.ts` with business logic for session state management.
- Built logic to validate active sessions and calculate streak increments safely.
- Bound API routes using Express `Router` in `server/src/routes/session.routes.ts`.
- Mapped `/api/session/*` routes in `server/src/index.ts`.
- Verified all endpoints (`/start`, `/active`, `/pause`, `/resume`, `/end`) by sending sequential fetch requests to ensure state machine transitions worked correctly.

### Next Steps
- **Milestone 05: Frontend — Focus Engine & Layout**

---

## 2026-07-20 — Session 05: Backend API - Data Routes

### Milestone: 04 — Backend API (Data Routes)

**Status:** ✅ Complete  
**Duration:** ~20 minutes  
**Difficulty:** 2/5  

### Accomplishments
- Implemented controllers and routes for all data endpoints (`dashboard`, `roadmap`, `logs`, `streaks`, `quizzes`, `settings`, `focus`).
- Fixed a schema alignment issue where `settings` didn't have an `updated_at` column, and correctly linked foreign keys for `focus_events`.
- Wired up 7 new routers into `index.ts`.
- Created an automated test script (`test-data-api.js`) that comprehensively tested all GET, POST, and PUT operations for data routes.

### Next Steps
- **Milestone 06: Frontend — Dashboard & Focus Engine**

---

## 2026-07-20 — Session 06: Frontend Foundation

### Milestone: 05 — Frontend Foundation & Dashboard
**Status:** ✅ Complete  
**Duration:** ~20 minutes  
**Difficulty:** 2/5  

### Accomplishments
- Implemented `react-router-dom` in the client package to handle application navigation.
- Established the base layout structure (`Sidebar` and `MainLayout`).
- Built modular UI components (`Card`, `Button`, `StatBox`) using the existing cyberpunk CSS classes.
- Created `useDashboard` custom React hook to successfully consume `/api/dashboard/today` from the Express backend.
- Developed the `Dashboard` page component which renders live data directly from the SQLite database.
- Fixed missing `DashboardResponse` type in the `@cyber-focus-coach/shared` package.
- Verified successful TypeScript compilation for both `shared` and `client` packages.

### Next Steps
- **Milestone 07: Core Components & Library**

---

## 2026-07-20 — Session 07: Focus Engine Foundation

### Milestone: 06 — Focus Engine & Timer Foundation
**Status:** ✅ Complete  
**Duration:** ~20 minutes  
**Difficulty:** 3/5  

### Accomplishments
- Established global session state management using `zustand` (`useSessionStore.ts`) to track active sessions across navigation boundaries.
- Designed a drift-resistant React `useTimer` hook using `Date.now()` delta calculation rather than naive increments.
- Architected a decoupled, event-driven `FocusEngine` to orchestrate various focus signal detectors.
- Implemented the first plugin: `VisibilityDetector` using the browser Page Visibility API to detect tab switching.
- Created the dedicated `/session` page and `TimerDisplay` component with cyberpunk styling for different session states (Active, Paused).
- Successfully connected the Dashboard's "START SESSION" button to the Express API backend, verifying the full `React -> API -> SQLite` data lifecycle.

### Hotfix (BUG-003 & BUG-004)
- Fixed `400 Bad Request` on Session Start by updating `useSessionStore` to send `planned_minutes: 60` and relaxing the `topic_id` constraint in the backend for unstructured sessions.
- Fixed `TypeError` on app refresh by correctly handling the `null` response from `GET /api/session/active` in the frontend `syncSession` logic.
- Fixed completely unresponsive Session UI (frozen timer, broken pause/resume buttons) by correcting the frontend's expected API payload format (removing `.session` wrapping).
- Fixed inactive Focus Engine by handling React Strict Mode double-mounts properly in `FocusEngine.registerDetector` to ensure fresh DOM closures are executed instead of stale, unmounted ones.
### Next Steps
- **Milestone 07: Core Components & Library**
---

### Git Commit Message
```
feat(db): establish sqlite database foundation

- Replace better-sqlite3 with @libsql/client due to python build failure
- Create schema.sql for all 10 core tables with proper FK constraints
- Create seed.sql with default user and 30 roadmap topics
- Add database.ts helper to manage libsql connection and PRAGMAs
- Add setup-db.ts execution script
- Update package.json with db:setup and db:reset lifecycle commands
```


## 2026-07-21 — Session 08: Milestone 5.75 - Session Controller Computing

### Milestone: 5.75 — Compute focused_minutes / paused_minutes
**Status:** ✅ Complete  
**Duration:** ~20 minutes  
**Difficulty:** 2/5  

### Accomplishments
- Implemented tracking of `paused_minutes` in `server/src/controllers/session.controller.ts`.
- `resumeSession` now computes the duration since the last 'paused' event and updates the database.
- `endSession` accurately computes `focused_minutes` by subtracting total `paused_minutes` from elapsed time.
- Integrated accurate `@cyber-focus-coach/shared` typings (`StudySession`, `SessionStatus`) into the backend controller to validate correctness.
- Resolved BUG-005 relating to focus stats permanently showing 0.

### Next Steps
- TBD

## 2026-07-21 — Session 09: Milestone 5 Finalization

### Milestone: 5 Finalization
**Status:** ✅ Complete  
**Duration:** ~15 minutes  
**Difficulty:** 2/5  

### Accomplishments
- **Task 1 & 2 (API Revert):** Reverted the unintended architectural change. Changed `PATCH /:id/*` session routes back to `POST /*`. The backend now automatically resolves the active session for the user instead of requiring the client to track and transmit a `sessionId`. All controllers successfully typecheck.
- **Task 3 (Business Rules):** Validated the `topic_id` rule. `topic_id` is currently optional. Upon reviewing `BUG_LOG.md` (BUG-003), this was an intentional product decision to allow for "unstructured sessions" (sessions without a specific roadmap topic). Thus, it has been left as optional to maintain that intentional business rule.
- **Task 4 (Time Accumulation Scenarios):** Ran automated E2E tests for Scenario A (single 30s pause) and Scenario B (multiple 20s pauses). 
- **Task 5 (Rounding Review):** Identified accumulation drift in `paused_minutes` due to `Math.round()`. (Documented in Technical Debt below).

### Technical Debt: Pause Accumulation Drift
When a session is paused multiple times for short intervals (e.g., 20 seconds), `Math.round(20000 / 60000)` evaluates to `0`. Thus, the database accumulates `0` paused minutes for that interval. If a user pauses 3 times for 20 seconds each, they have paused for a total of 1 minute, but the database records `0 + 0 + 0 = 0` paused minutes. 
**Recommendation:** Store exact durations (e.g., `paused_seconds` instead of `paused_minutes`) in the database, and only perform division/rounding when formatting the output for the frontend.

### Next Steps
- Awaiting next milestone.
