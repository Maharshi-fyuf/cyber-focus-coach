# Glossary
## Cyber Focus Coach

Domain-specific terms used throughout this codebase and documentation.

---

| Term | Definition |
|------|-----------|
| **Focus Confidence** | A score from 0–100 representing how confident the system is that the user is actively studying. Computed from multiple signals each second. |
| **Focus Signal** | Any input used to estimate focus state: tab visibility, cursor movement, camera face presence. |
| **Grace Period** | The number of seconds the focus confidence must remain below the threshold before the session is automatically paused. Prevents false positives from brief interruptions. |
| **Session** | One continuous (or pause-resumed) period of study. Has a start time, end time, focused minutes, and paused minutes. |
| **Focused Minutes** | Time within a session where focus confidence was above the threshold. This is the only time that counts toward the daily goal. |
| **Paused Minutes** | Time within a session where focus confidence was below the threshold. Does not count toward the daily goal. |
| **Streak** | The number of consecutive calendar days where the user met their daily focus target. Resets to 0 if a day is missed. |
| **Daily Target** | The number of focused minutes the user commits to each day. Default: 60 minutes. |
| **Roadmap Topic** | One unit of the 30-topic cybersecurity curriculum. Can be locked, unlocked, or completed. |
| **Locked Topic** | A roadmap topic that the user has not yet unlocked. Requires completing the prerequisite topic first. |
| **Artifact** | Content attached to a session: notes, reflections, or quiz answers. |
| **Focus Event** | A logged record of a focus signal change: tab_hidden, face_missing, cursor_idle, resumed, etc. The event log is append-only. |
| **Confidence Threshold** | The minimum confidence score required for the session timer to run. Default: 50/100. Configurable. |
| **Idle Threshold** | The number of seconds without cursor movement before the cursor_active signal becomes false. Default: 30 seconds. |
| **Monorepo** | A single Git repository containing multiple packages (client, server, shared). |
| **Workspace** | An npm concept where multiple packages within a monorepo can reference each other and share a single node_modules folder at the root. |
| **better-sqlite3** | The Node.js SQLite driver used in this project. It is synchronous (unlike most Node.js I/O) because SQLite is fast enough that async overhead is unnecessary. |
| **Zustand** | A minimal React state management library. Think of it as a global variable that React components can subscribe to. |
| **Vite** | A frontend build tool and development server. Faster than Webpack/Create React App because it uses native ES modules during development. |
| **Page Visibility API** | A browser API (`document.visibilityState`, `visibilitychange` event) that fires when the user switches tabs or minimizes the browser. |
| **getUserMedia** | A browser API that requests access to the user's camera (and/or microphone). Requires explicit user permission. |
| **ISO 8601** | An international standard for datetime formatting. Example: `2026-07-20T15:00:00.000Z`. All datetimes in this project use this format. |
| **UUID** | Universally Unique Identifier. A 128-bit random value used as the primary key for most records. Ensures uniqueness without a centralized ID generator. |
| **Conventional Commits** | A specification for Git commit messages. Format: `type(scope): description`. Examples: `feat(session): add pause endpoint`, `fix(db): handle missing user gracefully`. |
