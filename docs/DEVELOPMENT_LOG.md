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

**Blocked until:** Node.js LTS is installed by user

**After Node.js is installed:**  
1. Run `node --version` and `npm --version` to verify
2. Run `node-gyp` check to verify build tools
3. Begin **Milestone 01: Project Scaffold**
   - Initialize monorepo with npm workspaces
   - Create `client/` and `server/` packages
   - Install all dependencies
   - Configure TypeScript
   - Verify both dev servers start

---

### Git Commit Message (for end of this milestone)
```
docs: initialize repository and write full project documentation

- Add .gitignore for Node.js, SQLite, and OS files
- Write PRD.md, TRD.md, ARCHITECTURE.md, DATABASE_SCHEMA.md
- Write DECISIONS.md with 6 architectural decisions
- Write DEVELOPMENT_LOG.md, BUG_LOG.md, POSTMORTEMS.md
- Write CHANGELOG.md, API.md, ROADMAP.md, SETUP.md
- Write CONTRIBUTING.md, GLOSSARY.md, APP_FLOW.md
- Write IMPLEMENTATION_PLAN.md with full milestone breakdown

Environment status: Node.js missing (blocker), Git ready, VS Code ready
```
