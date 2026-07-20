# Implementation Plan
## Cyber Focus Coach

Full milestone breakdown for the MVP build.  
Each milestone is 30–90 minutes of focused work.

---

## Phase 0: Foundation (No Code)

### ✅ MILESTONE ENV-01: Environment Validation
**Status:** Complete  
**Deliverables:**
- Environment report
- Git initialized
- All docs/ files written
- Blocker identified (Node.js)

---

## Phase 1: Project Scaffold

### ✅ MILESTONE 01: Monorepo Setup
**Status:** Complete  
**Objective:** Create the correct project structure with all packages  
**Estimated Time:** 45 minutes  
**Difficulty:** 2/5  
**Prerequisites:** Node.js LTS installed

**Deliverables:**
- Root `package.json` with workspaces
- `client/` — React + Vite + TypeScript scaffold
- `server/` — Node.js + Express + TypeScript scaffold
- `shared/` — Shared types package
- `concurrently` dev script — `npm run dev` starts both servers
- Both dev servers accessible in browser
- TypeScript compiles without errors on both sides

**Git Commit:**
```
feat(scaffold): initialize monorepo with React+Vite and Express
```

---

### ✅ MILESTONE 02: Database Foundation
**Status:** Complete  
**Objective:** Create the SQLite schema, seed data, and database service  
**Estimated Time:** 60 minutes  
**Difficulty:** 2/5  
**Prerequisites:** Milestone 01 complete

**Deliverables:**
- `server/src/db/schema.sql` — all 10 tables
- `server/src/db/seed.sql` — 30 topics, sample quizzes
- `server/src/db/database.ts` — database connection and helpers
- `npm run db:setup` works
- Can query the database and see seed data

---

### ⏳ MILESTONE 03: Backend API — Session Routes
**Status:** Not started  
**Objective:** Implement session lifecycle API endpoints  
**Estimated Time:** 60–90 minutes  
**Difficulty:** 3/5  
**Prerequisites:** Milestone 02 complete

**Deliverables:**
- `POST /api/session/start` — creates session record
- `POST /api/session/pause` — updates session status, logs event
- `POST /api/session/resume` — resumes session
- `POST /api/session/end` — completes session, triggers streak update
- `GET /api/session/active` — returns current session
- All routes tested manually (curl or Postman)
- Session state machine correctly enforced

---

### ⏳ MILESTONE 04: Backend API — Data Routes
**Status:** Not started  
**Objective:** Implement dashboard, roadmap, logs, and settings endpoints  
**Estimated Time:** 60 minutes  
**Difficulty:** 2/5  
**Prerequisites:** Milestone 03 complete

**Deliverables:**
- `GET /api/dashboard/today`
- `GET /api/roadmap`
- `PATCH /api/roadmap/:id/complete`
- `POST /api/logs`, `GET /api/logs/:date`
- `GET /api/streaks`
- `GET/PUT /api/settings`
- `GET /api/quizzes/topic/:id`
- `POST /api/quizzes/:id/attempt`

---

## Phase 2: Frontend Foundation

### ⏳ MILESTONE 05: Design System
**Status:** Not started  
**Objective:** Create the CSS foundation (colors, typography, spacing, utilities)  
**Estimated Time:** 45 minutes  
**Difficulty:** 2/5

**Deliverables:**
- CSS custom properties (design tokens)
- Typography (JetBrains Mono + Inter)
- Base component styles (buttons, cards, inputs, badges)
- Dark cyberpunk theme
- Layout (sidebar + main content)

---

### ⏳ MILESTONE 06: Zustand Store + API Client
**Status:** Not started  
**Objective:** Create client-side state and typed API fetch wrappers  
**Estimated Time:** 45 minutes  
**Difficulty:** 2/5

**Deliverables:**
- `client/src/store/` — Zustand store with all slices
- `client/src/api/` — typed fetch functions for every endpoint
- TypeScript types imported from `shared/`

---

### ⏳ MILESTONE 07: Core Components
**Status:** Not started  
**Objective:** Build the reusable UI component library  
**Estimated Time:** 90 minutes  
**Difficulty:** 3/5

**Deliverables:**
- Sidebar + Navigation
- FocusTimerRing (SVG animated)
- FocusSignalPanel
- PauseModal
- StreakCard
- StatBox
- RoadmapTrack (topic nodes)
- QuizCard
- TutorHint (expandable)
- WebcamPreview

---

## Phase 3: Pages + Focus Engine

### ⏳ MILESTONE 08: Onboarding Page
**Status:** Not started  
**Objective:** Multi-step setup wizard  
**Estimated Time:** 45 minutes  
**Difficulty:** 2/5

---

### ⏳ MILESTONE 09: Dashboard Page
**Status:** Not started  
**Estimated Time:** 45 minutes  
**Difficulty:** 2/5

---

### ⏳ MILESTONE 10: Focus Session Page + Focus Engine
**Status:** Not started  
**Objective:** Live timer, signal panel, webcam, session controls  
**Estimated Time:** 90 minutes  
**Difficulty:** 4/5 (most complex milestone)

---

### ⏳ MILESTONE 11: Roadmap, Logs, Review, Settings Pages
**Status:** Not started  
**Estimated Time:** 90 minutes  
**Difficulty:** 3/5

---

## Phase 4: Polish + Testing

### ⏳ MILESTONE 12: Integration Testing
**Estimated Time:** 60 minutes

### ⏳ MILESTONE 13: Error Handling + Edge Cases
**Estimated Time:** 45 minutes

### ⏳ MILESTONE 14: Performance Audit
**Estimated Time:** 30 minutes

### ⏳ MILESTONE 15: Final Documentation Pass
**Estimated Time:** 30 minutes

---

## Total Estimated Time

| Phase | Milestones | Estimated |
|-------|-----------|-----------|
| Phase 0 | ENV-01 | ✅ Done |
| Phase 1 | 01–04 | ~4.5 hours |
| Phase 2 | 05–06 | ~1.5 hours |
| Phase 3 | 07–11 | ~6 hours |
| Phase 4 | 12–15 | ~2.5 hours |
| **Total** | | **~14.5 hours** |
