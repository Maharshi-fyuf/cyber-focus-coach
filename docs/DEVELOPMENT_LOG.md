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
- **Milestone 04: Backend API — Data Routes**

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

