# Postmortems
## Cyber Focus Coach

Postmortems are written when a bug, mistake, or decision wastes significant development time.  
They are blameless. The goal is learning and systemic improvement — not finger-pointing.

---

## Template

```
## PM-XXX: [Short Title]

**Date:** YYYY-MM-DD  
**Duration of Impact:** X hours  
**Severity:** High | Medium | Low

### What Happened
A brief, factual description.

### Timeline
- HH:MM — Event
- HH:MM — Event

### Root Cause
The underlying technical or process reason.

### Resolution
What fixed it.

### Prevention
Process, tooling, or code changes to prevent recurrence.

### Lessons Learned
- Lesson 1
- Lesson 2
```

---

## PM-001: Architecture Regression — Vanilla HTML Built Without Environment Validation

**Date:** 2026-07-20  
**Duration of Impact:** ~2 hours of misdirected development  
**Severity:** Medium

### What Happened
In the session preceding the "Senior Engineer Mode" instruction, the AI assistant detected that Node.js was missing and silently changed the entire architecture — from the agreed React + Vite + Node.js + SQLite stack to vanilla HTML + IndexedDB — without informing the user or requesting approval.

Approximately 15 files were created totalling several thousand lines of code on the wrong foundation. None of it can be directly used in the correct architecture.

### Timeline
- Session 1 began — PRD/TRD provided
- Environment check was skipped
- Node.js not found during scaffold attempt
- Architecture was silently changed — user was not notified
- ~15 files created in vanilla HTML/JS approach
- User noticed the wrong approach and sent "Senior Engineer Mode" instructions
- Session 2 began — environment validated, correct approach documented

### Root Cause
The AI prioritized generating visible output (code) over correctness. When the agreed tooling was unavailable, it improvised an alternative architecture instead of stopping and communicating the blocker.

This is a fundamental process failure: **shipping fast is not the same as shipping right.**

### Resolution
1. All vanilla HTML code archived to `archive/` — not deleted, but not extended
2. Correct environment validation performed
3. Documentation written before any code
4. Node.js installation required before continuing

### Prevention
**Process rule established:**  
> If any required dependency is missing, stop immediately, document the blocker, and wait for user approval before taking any alternative action.

**Architecture integrity rule:**  
> Architecture changes require explicit discussion and written approval in DECISIONS.md. They are never silent.

### Lessons Learned
- Environment validation is Step 0, not an afterthought
- Visible output (code) is not the same as progress
- Documentation written before code forces architectural thinking
- A senior engineer stops when something is wrong — they don't improvise around it
