# Decision Log
## Cyber Focus Coach

Every significant architectural or technical decision is recorded here.  
Future developers — including future-you — should understand **why** each decision was made, not just what was decided.

---

## DEC-001: Technology Stack — React + Vite + Node.js + SQLite

**Date:** 2026-07-20  
**Status:** Decided  
**Made by:** Engineering team

### Decision
Use React 18 + TypeScript + Vite for the frontend, Node.js + Express for the backend, and SQLite via `better-sqlite3` for the database.

### Why
- React is the industry standard for complex single-page applications. It has the largest ecosystem, best TypeScript support, and is the most in-demand skill for frontend engineers.
- Vite replaces Webpack/CRA and is dramatically faster (native ESM + esbuild). Dev server starts in milliseconds.
- TypeScript was chosen because this is a complex application with asynchronous state machines, browser APIs, and database I/O. Runtime type errors in this context are expensive to debug.
- Node.js keeps the stack in one language, reducing context-switching.
- SQLite is the correct database for a local-first, single-user application. It is a single file, requires no server process, and has zero configuration.

### Alternatives Considered

**Option A: Next.js (full-stack)**
- Pros: One framework for both frontend and backend, built-in SSR, simpler deployment
- Cons: SSR is unnecessary for localhost app, adds complexity, and obscures the client/server boundary — important to learn

**Option B: Python (FastAPI) + SQLite**
- Pros: FastAPI is excellent, Python has better ML/CV libraries for future face detection
- Cons: Two languages (JS frontend + Python backend), Python is currently broken on this machine, harder to share types across the stack

**Option C: Vanilla HTML + IndexedDB (what the previous session built)**
- Pros: No build step, works from file://, instant setup
- Cons: **Wrong architecture** — IndexedDB has no SQL, no relations, no migrations, no querying capability. This is a production application, not a prototype. Also: violates the agreed architecture without approval.

### Trade-offs
- More setup required upfront (Node.js must be installed)
- `better-sqlite3` requires a native build (node-gyp) — the Node.js installer handles this if "Tools for Native Modules" is checked

### Future Impact
- TypeScript types can be shared between client and server via the `shared/` package
- The SQLite database file can be exported/imported for backup or migration
- If multi-user support is needed later, migration to PostgreSQL is straightforward

---

## DEC-002: Monorepo Structure — npm Workspaces

**Date:** 2026-07-20  
**Status:** Decided

### Decision
Use a monorepo with npm workspaces, containing three packages: `client`, `server`, and `shared`.

### Why
- A monorepo keeps all code in one Git repository, making atomic commits across frontend and backend easy
- npm workspaces (built into npm 7+) allow `client` and `server` to share the `shared` types package without publishing to npm
- Simpler than alternatives for a team of one
- `concurrently` will run both dev servers with a single `npm run dev` command from the root

### Alternatives Considered
- **Separate repos**: More Git overhead, harder to keep in sync, no shared types
- **Turborepo/Nx**: More powerful but overkill for this project size. Would add complexity without benefit.

---

## DEC-003: State Management — Zustand over Redux

**Date:** 2026-07-20  
**Status:** Decided

### Decision
Use Zustand for client-side state management.

### Why
Zustand is dramatically simpler than Redux for the same outcome. It has:
- No boilerplate (no actions, reducers, dispatch)
- Native TypeScript support
- Middleware support for persistence and devtools
- Small bundle size (~1.1KB)

For a single-user local app with straightforward state (session status, focus signals, streak data), Redux would be over-engineering.

### Alternatives Considered
- **Redux Toolkit**: Still more boilerplate than needed. Better for large teams.
- **React Context**: No performance optimization (all consumers re-render). Fine for small state, but the session/focus state will update every second — Context would cause excessive re-renders.
- **Jotai/Recoil**: Atom-based, valid option. Zustand is simpler for beginners and equally capable.

---

## DEC-004: Focus Detection — Browser APIs over ML Model (MVP)

**Date:** 2026-07-20  
**Status:** Decided (MVP only)

### Decision
For MVP, use browser-native APIs for focus detection (Page Visibility API + mouse events + getUserMedia with pixel-level skin detection). Defer MediaPipe/ML-based face detection to V1.

### Why
- MediaPipe requires loading a WASM bundle (~5MB). Adds complexity to the build pipeline.
- For MVP validation, pixel-level skin tone detection is sufficient to detect face presence
- The tab visibility and cursor idle signals alone provide significant accountability value
- Simpler MVP = faster to a working, testable product

### Trade-offs
- Skin detection is less accurate than ML face detection (lighting, skin tone variation)
- False positives possible in low-light conditions
- **Mitigation**: Grace period + confidence scoring means one false negative doesn't immediately pause the session

### V1 Plan
Integrate MediaPipe Face Detection (WASM, runs in browser, no server needed) after MVP is stable.

---

## DEC-005: Database Driver — better-sqlite3 over node-sqlite3

**Date:** 2026-07-20  
**Status:** Decided

### Decision
Use `better-sqlite3` instead of the older `sqlite3` (node-sqlite3) package.

### Why
- `better-sqlite3` is **synchronous** — SQLite operations are fast enough that async overhead is unnecessary and adds complexity
- Cleaner API — no callbacks, no promise wrappers needed
- Better TypeScript support
- Actively maintained
- Used by major projects (Astro, many others)

### Trade-offs
- Requires native build (C++ addon via node-gyp) — handled by installing Node.js with "Tools for Native Modules"
- If native build fails, fallback is `sql.js` (pure WASM, no native build needed, slightly larger bundle)

---

## DEC-006: Previous Session Code — Archive, Do Not Extend

**Date:** 2026-07-20  
**Status:** Decided

### Decision
The vanilla HTML/IndexedDB code written in the previous session will be moved to an `archive/` directory. It will not be extended or built upon.

### Why
- It violates the agreed architecture (vanilla HTML ≠ React + Vite)
- It was generated without tests, documentation, Git history, or architectural review
- Extending it would mean building a production application on a fundamentally wrong foundation
- The correct approach is to build the right thing properly, even if it takes longer

### What to Keep
- **Seed data** (30 topics, quiz questions, tutor hints) — will be migrated to SQL seed file
- **CSS design concepts** (color palette, typography choices) — will be adapted to the new CSS-in-JS or CSS module approach
- **Business logic concepts** (focus scoring formula, streak computation) — will be reimplemented with proper TypeScript types and tests

### What to Discard
- All HTML structure
- IndexedDB wrapper
- Vanilla JS state management
- The router
- All page/component files (will be rebuilt as React components)
