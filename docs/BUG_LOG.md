# Bug Log
## Cyber Focus Coach

All bugs are recorded here. Never delete entries.

---

## Template

```
## BUG-XXX: [Short Description]

**ID:** BUG-XXX  
**Date:** YYYY-MM-DD  
**Severity:** Critical | High | Medium | Low  
**Status:** Open | Resolved | Won't Fix

### Description
What happened?

### Steps to Reproduce
1.
2.
3.

### Root Cause
Why did it happen?

### Resolution
How was it fixed?

### Prevention
What process or code change prevents recurrence?

### Files Affected
- file.ts

### Related Commits
- abc1234
```

---

## BUG-001: Python PATH Broken — py Launcher Points to Missing Executable

**ID:** BUG-001  
**Date:** 2026-07-20  
**Severity:** Medium (blocks Python usage, not blocking Node.js work)  
**Status:** Open — deferred (non-blocking for Milestone 1 Node.js build)

### Description
Running `py --version` produces: `Unable to create process using 'python3.15t.exe': The system cannot find the file specified`. The py launcher (Windows Python launcher) is configured to use Python 3.15 as the default, but the Python 3.15 installation is an experimental free-threaded build missing the standard `python.exe` executable.

### Root Cause
Two Python installations are present:
- Python 3.13: `AppData\Local\Programs\Python\Python313` — has Scripts and DLLs but **no python.exe in root**
- Python 3.15: Experimental free-threaded build — executable is named `python3.15t.exe`, not `python.exe`

The py launcher's default points to 3.15t, which doesn't exist at the expected path.
### [BUG-002] `better-sqlite3` native build fails due to missing Python and new Node version
- **Status**: ✅ Resolved (Intentional Choice)
- **Date**: 2026-07-20
- **Environment**: Windows, Node v24.18.0
- **Symptom**: `npm install better-sqlite3` triggers `node-gyp rebuild` which fails instantly because `Python` is not available (see BUG-001). Prebuilt binaries for Node v24 (ABI 137) do not exist yet.
- **Root Cause**: `better-sqlite3` strictly requires native C++ compilation when a prebuilt binary isn't available for the target Node.js version.
- **Resolution**: Swapped `better-sqlite3` for `@libsql/client`. LibSQL provides a drop-in SQLite replacement that does not require `node-gyp` to compile on the target machine, allowing us to bypass the missing Python environment completely while keeping local `.db` file support.
### Resolution
Install clean Python 3.13 from python.org (official installer, not Microsoft Store or Anaconda). Check "Add to PATH" during installation.

### Prevention
Always install Python from python.org using the official installer. Verify with `python --version` immediately after install.

### Files Affected
- None (environment issue, not code)

---

## BUG-003: Session Start 400 Bad Request & React TypeError on syncSession

**ID:** BUG-003  
**Date:** 2026-07-20  
**Severity:** High (blocked primary user flow)  
**Status:** Resolved

### Description
When clicking "START SESSION" on the dashboard, the backend returned HTTP 400 Bad Request. Subsequently, `syncSession` threw `TypeError: Cannot read properties of null (reading 'status')`, completely breaking the session view.

### Steps to Reproduce
1. Start the client and server.
2. Ensure no active sessions exist in the DB.
3. Refresh the app (triggers `syncSession`). The UI crashes.
4. Click "START SESSION" from the Dashboard. Network logs show 400 Bad Request for `/api/session/start`.

### Root Cause
Two API contract mismatches:
1. `POST /api/session/start` strictly required `topic_id` and `planned_minutes`, but `Dashboard.tsx` and `useSessionStore.ts` omitted `planned_minutes` entirely, and failed when `topic_id` was undefined for unstructured sessions.
2. `GET /api/session/active` returned HTTP 200 with a body of `null` when no session existed. The frontend `syncSession` checked `res.status === 404` to handle missing sessions, so the 200 OK passed, `await res.json()` evaluated to `null`, and `data.status` triggered a TypeError.

### Resolution
1. **Frontend:** Updated `syncSession` to handle `if (!data)`. 
2. **Frontend:** Updated `startSession` to inject `planned_minutes: 60` by default and pass it in the request body.
3. **Backend:** Relaxed `topic_id` validation in `session.controller.ts` so unstructured sessions (null `topic_id`) are permitted.

### Prevention
1. Type check API payloads more strictly, perhaps using Zod for runtime validation on both ends.
2. Ensure the "Not Found" convention (returning 404 vs returning 200 `null`) is documented and standardized across the app.

### Files Affected
- `client/src/stores/useSessionStore.ts`
- `server/src/controllers/session.controller.ts`

---

## BUG-004: Focus Engine Session Silently Failing

**ID:** BUG-004  
**Date:** 2026-07-20  
**Severity:** Critical (core feature failure)  
**Status:** Resolved

### Description
1. The session timer permanently stayed at 00:00.
2. Clicking Pause/Resume had absolutely no effect.
3. Switching browser tabs did not track distractions or trigger the Focus Engine.

### Steps to Reproduce
1. Click "START SESSION" on the dashboard.
2. Observe the timer sticking at 00:00.
3. Attempt to pause/resume or switch tabs. No state changes occur.

### Root Cause
1. **Zustand Data Mapping Error**: The backend `POST /api/session/start` and `PATCH` endpoints returned the raw session object. The frontend store mistakenly expected `{ session: data }` and assigned `currentSession = data.session`, resulting in `currentSession` being permanently `undefined`.
2. **Early Exit Guard Clauses**: Because `currentSession` was `undefined`, the timer's `tick()` function bypassed time calculation. The `pauseSession` and `resumeSession` actions both had `if (!currentSession) return;` guard clauses, causing them to silently abort before making any API calls.
3. **React Strict Mode Singleton Collision**: `FocusEngine.ts` registered detectors by name. In React Strict Mode, the component double-mounted, instantiating two `VisibilityDetector`s. The second instance was rejected because the name was taken. The `FocusEngine` started the first instance (which had a stale closure/null dispatch from the previous unmount), causing the DOM events to disappear into a void.

### Resolution
1. Corrected data mapping in `useSessionStore.ts` to `currentSession = data` for all endpoints.
2. Updated `syncSession` to correctly normalize backend `session_status` ('running', 'paused') to the frontend TypeScript union ('ACTIVE', 'PAUSED').
3. Rewrote `FocusEngine.registerDetector` to cleanly stop and overwrite old detector instances, guaranteeing the engine always executes the most recent React component closures.

### Prevention
Strictly log the payloads returned from API calls before mapping them into global state. If a core object is undefined, components should visibly throw an error boundary rather than silently suppressing features.

### Files Affected
- `client/src/stores/useSessionStore.ts`
- `client/src/engine/FocusEngine.ts`

## BUG-005: focused_minutes and paused_minutes Always Zero

**ID:** BUG-005  
**Date:** 2026-07-21  
**Severity:** High (blocks downstream features like dashboard accuracy)  
**Status:** Resolved

### Description
`study_sessions.focused_minutes` and `paused_minutes` currently default to 0 and are never written anywhere, causing the dashboard's "Today's Focus" stat to be permanently 0/60 regardless of real usage.

### Steps to Reproduce
1. Start a session.
2. Pause and resume the session.
3. End the session.
4. Check the dashboard; "Today's Focus" remains at 0.

### Root Cause
Never implemented. The columns were present in the schema, but `session.controller.ts` did not compute or update them during pause, resume, or end transitions.

### Resolution
Updated `session.controller.ts`:
- `resumeSession`: Queries the last 'paused' event timestamp, calculates the duration, and adds it to `paused_minutes`.
- `endSession`: Calculates total elapsed time, accounts for any active pause duration, and sets `focused_minutes` as total elapsed time minus total `paused_minutes`.

### Prevention
Ensure business logic calculating core metrics is implemented before downstream consumers (like the dashboard) rely on them.

### Files Affected
- `server/src/controllers/session.controller.ts`

---
