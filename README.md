# Cyber Focus Coach

A local-first cybersecurity study accountability app with focus detection, session tracking, streaks, and a tutor experience.

---

## What is this?

Cyber Focus Coach helps a cybersecurity learner stay accountable while studying. It:

- Tracks daily study sessions with a configurable timer
- Enforces focus using transparent, opt-in signals (tab visibility, cursor activity, camera)
- Maintains a 30-topic cybersecurity roadmap
- Logs daily progress and builds streaks
- Provides tutor hints — not full answers

All data stays local. No cloud, no accounts, no tracking.

---

## Quick Start

```bash
# Install Node.js LTS first (see docs/SETUP.md)
npm install
npm run db:setup
npm run dev
```

Open: **http://localhost:5173**

---

## Documentation

All documentation lives in [`docs/`](./docs/):

| File | Description |
|------|-------------|
| [PRD.md](./docs/PRD.md) | What we're building and why |
| [TRD.md](./docs/TRD.md) | Technical requirements and stack |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design and module map |
| [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | SQLite schema reference |
| [API.md](./docs/API.md) | All API endpoints |
| [SETUP.md](./docs/SETUP.md) | Developer setup guide |
| [IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) | Milestone breakdown |
| [DECISIONS.md](./docs/DECISIONS.md) | Why every major decision was made |
| [DEVELOPMENT_LOG.md](./docs/DEVELOPMENT_LOG.md) | Engineering diary |
| [CHANGELOG.md](./docs/CHANGELOG.md) | Version history |

---

## Status

**Phase:** Pre-alpha — Foundation complete, awaiting Node.js installation  
**Blocker:** Node.js LTS must be installed to proceed with code

See [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) for the full milestone roadmap.

---

## Stack

- **Frontend:** React 18 + TypeScript + Vite + Zustand
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite via better-sqlite3
- **Dev:** localhost:5173 (client) + localhost:3001 (server)
