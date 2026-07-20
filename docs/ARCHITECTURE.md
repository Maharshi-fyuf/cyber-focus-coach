# Architecture Overview
## Cyber Focus Coach

**Version:** 1.0.0  
**Last Updated:** 2026-07-20

---

## System Overview

Cyber Focus Coach is a **monorepo** containing a React/TypeScript frontend and a Node.js/Express backend, running as two local processes that communicate over HTTP on localhost.

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S MACHINE                           │
│                                                                 │
│  ┌─────────────────────────┐    ┌──────────────────────────┐   │
│  │   FRONTEND              │    │   BACKEND                │   │
│  │   React + Vite          │◄──►│   Node.js + Express      │   │
│  │   localhost:5173        │    │   localhost:3001         │   │
│  │                         │    │                          │   │
│  │  ┌──────────────────┐   │    │  ┌────────────────────┐  │   │
│  │  │  Focus Engine    │   │    │  │  Session Manager   │  │   │
│  │  │  (tab/cursor/cam)│   │    │  │  Streak Tracker    │  │   │
│  │  └──────────────────┘   │    │  │  Log Writer        │  │   │
│  │                         │    │  └────────────────────┘  │   │
│  │  ┌──────────────────┐   │    │                          │   │
│  │  │  Zustand Store   │   │    │  ┌────────────────────┐  │   │
│  │  │  (client state)  │   │    │  │  SQLite Database   │  │   │
│  │  └──────────────────┘   │    │  │  cfc.db            │  │   │
│  └─────────────────────────┘    │  └────────────────────┘  │   │
│                                 └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Module Map

```
cyber-focus-coach/               ← Monorepo root
│
├── client/                      ← React frontend (Vite)
│   ├── src/
│   │   ├── components/          ← Reusable UI components
│   │   ├── pages/               ← Route-level page components
│   │   ├── features/            ← Feature modules (session, roadmap, etc.)
│   │   │   ├── focus/           ← Focus Engine
│   │   │   ├── session/         ← Session state machine
│   │   │   ├── roadmap/         ← Topic management
│   │   │   ├── logs/            ← Daily journal
│   │   │   ├── streaks/         ← Streak computation
│   │   │   └── tutor/           ← Hint system
│   │   ├── store/               ← Zustand global store
│   │   ├── hooks/               ← Custom React hooks
│   │   ├── api/                 ← API client (fetch wrappers)
│   │   └── types/               ← TypeScript type definitions
│   └── public/
│
├── server/                      ← Node.js + Express backend
│   ├── src/
│   │   ├── routes/              ← Express route handlers
│   │   ├── services/            ← Business logic
│   │   ├── db/                  ← SQLite connection + migrations
│   │   └── types/               ← Shared TypeScript types
│   └── data/                    ← SQLite database file (gitignored)
│
├── docs/                        ← All project documentation
│   ├── PRD.md
│   ├── TRD.md
│   ├── ARCHITECTURE.md          ← This file
│   └── ...
│
├── shared/                      ← Types shared between client + server
│   └── types.ts
│
├── .gitignore
├── package.json                 ← Root package.json (workspaces)
└── README.md
```

---

## Data Flow: Session Lifecycle

```
User clicks "Start Session"
        │
        ▼
[React] SessionPage.handleStart()
        │
        ├─► [API Client] POST /api/session/start
        │         │
        │         ▼
        │   [Express] sessionRoutes.start()
        │         │
        │         ▼
        │   [SessionService] createSession()
        │         │
        │         ▼
        │   [SQLite] INSERT INTO study_sessions
        │         │
        │         ◄─── returns session record
        │
        ├─► [FocusEngine] engine.start(config)
        │         │
        │         └─► begins sampling tab/cursor/camera every 1s
        │
        ▼
[Zustand] store.setSession({ status: 'running', ... })
        │
        ▼
[React] UI updates: timer starts, signals display live
```

---

## Data Flow: Focus Signal → Pause

```
FocusEngine samples every 1 second
        │
        ▼
computeConfidence(signals) → score: 0-100
        │
        ├── score >= threshold → grace period resets, continue
        │
        └── score < threshold → grace period increments
                  │
                  └── grace period > limit (10s)
                            │
                            ▼
                  [API Client] POST /api/session/pause { reason }
                            │
                            ▼
                  [SQLite] UPDATE study_sessions SET status='paused'
                  [SQLite] INSERT INTO focus_events
                            │
                            ▼
                  [Zustand] store.setStatus('paused')
                            │
                            ▼
                  [React] PauseModal renders with reason
```

---

## Component Status

| Module | Status | Notes |
|--------|--------|-------|
| Git Repository | ✅ Done | Initialized, main branch |
| Documentation | 🔄 In Progress | Writing now |
| Project Scaffold | ⏳ Blocked | Waiting for Node.js |
| Frontend - React/Vite | ⏳ Blocked | Waiting for Node.js |
| Backend - Express | ⏳ Blocked | Waiting for Node.js |
| Database - SQLite | ⏳ Blocked | Waiting for Node.js |
| Focus Engine | ⏳ Blocked | Waiting for Node.js |
| UI Components | ⏳ Blocked | Waiting for Node.js |
| Pages | ⏳ Blocked | Waiting for Node.js |
| Testing | ⏳ Not started | Milestone 6 |

---

## Key Architectural Decisions

See `docs/DECISIONS.md` for full decision rationale.

| Decision | Choice | Alternatives Considered |
|----------|--------|------------------------|
| Frontend framework | React + Vite | Next.js, Svelte |
| Type system | TypeScript | Plain JavaScript |
| Backend runtime | Node.js + Express | Python + FastAPI |
| Database | SQLite + better-sqlite3 | PostgreSQL, IndexedDB |
| State management | Zustand | Redux, React Context |
| Monorepo structure | npm workspaces | Turborepo, Nx |
