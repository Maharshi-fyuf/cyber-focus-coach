# Archive — Session 01 (Vanilla HTML/IndexedDB)

This directory contains code written during the first session before the "Senior Engineer Mode" instruction was given.

## Why it was archived

The code was written on the wrong architecture:
- **Built:** Vanilla HTML + JavaScript + IndexedDB
- **Agreed:** React + Vite + TypeScript + Node.js + Express + SQLite

The architecture was changed silently without user approval because Node.js was missing. This was incorrect. See `docs/POSTMORTEMS.md#PM-001` for the full postmortem.

## What can be reused

| File/Concept | Reusable? | Notes |
|-------------|-----------|-------|
| `js/seed.js` | ✅ Yes | 30 roadmap topics, quiz questions, tutor hints — migrate to `server/src/db/seed.sql` |
| `style.css` | ✅ Partial | Color palette, typography choices are good — adapt to CSS Modules |
| `js/focus.js` | ✅ Concepts | Focus confidence formula is correct — reimplement in TypeScript |
| `js/api.js` | ⚠️ Concepts only | Business logic is correct, but must be reimplemented in Express |
| `js/db.js` | ❌ No | IndexedDB is not SQLite — different query model entirely |
| All HTML structure | ❌ No | React replaces HTML templates |
| `js/router.js` | ❌ No | React Router replaces this |
| All page files | ❌ No | Rebuild as React components |

## Do not extend this code

Do not add files here. Do not import from here. This is a historical reference only.
