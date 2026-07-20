# Setup Guide
## Cyber Focus Coach

This guide walks a developer through setting up the project from scratch on a new machine.

---

## Prerequisites

You need the following installed before beginning:

| Tool | Version | Install |
|------|---------|---------|
| Git | Any recent | https://git-scm.com |
| Node.js | 22.x LTS | https://nodejs.org/en/download |
| npm | Comes with Node.js | — |
| Chrome/Edge/Brave | Latest | Any Chromium browser |

### Installing Node.js on Windows

1. Go to https://nodejs.org/en/download
2. Download **Windows Installer (.msi) — LTS**
3. Run installer
4. On the "Tools for Native Modules" screen: **check the box**  
   (This installs `node-gyp`, build tools, and Chocolatey — required for `better-sqlite3`)
5. After installation completes, restart your terminal
6. Verify:
   ```bash
   node --version   # should show v22.x.x
   npm --version    # should show 10.x.x
   ```

---

## Installation

```bash
# 1. Clone the repository
git clone <repo-url> cyber-focus-coach
cd cyber-focus-coach

# 2. Install all dependencies (root + all workspaces)
npm install

# 3. Set up the database
npm run db:setup    # Creates SQLite schema and seeds data

# 4. Start development servers
npm run dev         # Starts both frontend (5173) and backend (3001)
```

The app will be available at: **http://localhost:5173**

---

## Environment Variables

The backend uses a `.env` file for configuration. Copy the example:

```bash
cp server/.env.example server/.env
```

Default values work for local development. See `server/.env.example` for documentation of each variable.

---

## Project Structure

```
cyber-focus-coach/
├── client/           ← React + TypeScript frontend (port 5173)
├── server/           ← Node.js + Express backend (port 3001)
├── shared/           ← Shared TypeScript types
├── docs/             ← All documentation
├── archive/          ← Archived code (do not extend)
└── package.json      ← Root — npm workspaces config
```

---

## Available Scripts

Run from the **project root**:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both dev servers concurrently |
| `npm run dev:client` | Start only the frontend |
| `npm run dev:server` | Start only the backend |
| `npm run build` | Build both packages for production |
| `npm run db:setup` | Initialize SQLite schema + seed |
| `npm run db:reset` | Drop and recreate the database |
| `npm run test` | Run all tests |
| `npm run lint` | Run ESLint across all packages |
| `npm run typecheck` | TypeScript type checking |

---

## Common Issues

### `better-sqlite3` fails to build
**Cause:** node-gyp build tools not installed  
**Fix:** Reinstall Node.js and check "Automatically install tools" on the Tools screen

### Port 5173 already in use
**Fix:** `npx kill-port 5173` or change the port in `client/vite.config.ts`

### Database is empty after setup
**Fix:** Run `npm run db:reset` to drop and reseed

### Camera permission denied
**Expected behavior.** Camera is optional. Enable it in Settings → Focus Detection → Camera toggle.

---

## Development Workflow

We follow a milestone-based workflow:

1. Read the relevant `docs/IMPLEMENTATION_PLAN.md` milestone
2. Create a feature branch: `git checkout -b feat/milestone-name`
3. Implement the milestone
4. Update `docs/DEVELOPMENT_LOG.md`
5. Commit with a conventional commit message
6. Merge to main

See `docs/CONTRIBUTING.md` for full workflow details.
