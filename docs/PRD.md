# Product Requirements Document (PRD)
## Cyber Focus Coach

**Version:** 1.0.0  
**Status:** Active Development  
**Owner:** khama  
**Last Updated:** 2026-07-20

---

## 1. Problem Statement

Studying alone is easy to start and hard to sustain. A cybersecurity learner working independently has no external accountability mechanism. Sessions get cut short, distractions go unchallenged, and progress is invisible.

The user needs a tool that transforms a self-directed cybersecurity curriculum into a structured, accountable daily practice — with transparent focus enforcement, visible progress, and a streak-based motivational loop.

---

## 2. Product Summary

Cyber Focus Coach is a **local-first web application** that helps a single user stay accountable while learning cybersecurity. It:

- Tracks a configurable daily study session (default: 60 minutes)
- Enforces focus using browser-accessible signals (camera, tab visibility, cursor activity)
- Maintains a daily roadmap of cybersecurity topics
- Logs progress, builds streaks, and provides a strict tutor experience

**Core rule:** Only time spent in an approved focus state counts toward the session timer.

---

## 3. Target User

A single cybersecurity learner who:
- Studies independently, without a classroom or instructor
- Wants daily accountability with visible, meaningful progress
- Is preparing for certifications, CTF competitions, or a career in security
- Understands and accepts opt-in focus monitoring for their own benefit

---

## 4. Goals

### Primary Goals
1. Help the user complete 1 hour of cybersecurity practice every day
2. Enforce focus using transparent, opt-in signals only
3. Preserve daily logs, streaks, and topic completion history
4. Provide a strict tutor experience that gives hints — not full answers — by default
5. Work fully offline on localhost with zero cloud dependency

### Non-Goals (v1)
- No covert surveillance
- No hidden camera or screen capture
- No background tracking when session is not active
- No multi-user, classroom, or enterprise monitoring
- No mobile application
- No cross-device sync

---

## 5. Core User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-01 | Learner | Start a study session with a target duration | I have a clear time commitment |
| US-02 | Learner | Have the timer pause when I am distracted | Only real focus time is counted |
| US-03 | Learner | See exactly why the timer paused | I understand what triggered it |
| US-04 | Learner | Follow a daily roadmap of what to study | I have a structured learning path |
| US-05 | Learner | Log what I learned each day | I build a personal knowledge journal |
| US-06 | Learner | See streaks, total hours, and completed labs | I feel motivated by visible progress |
| US-07 | Learner | Receive hints, not full answers | I build real understanding, not dependency |
| US-08 | Learner | Control all privacy settings explicitly | I trust the app with my data |

---

## 6. MVP Scope

### In Scope
- Local web dashboard (React + Vite frontend)
- Session lifecycle: Start / Pause / Resume / End
- Daily roadmap with 30 ordered cybersecurity topics
- Focus state detection:
  - Tab visibility (Page Visibility API)
  - Cursor idle detection (mousemove events)
  - Camera face presence (optional, getUserMedia)
- Manual notes entry after each session
- Streak tracking and history dashboard
- Local SQLite database (via backend)
- Tutor hints system (rule-based, per topic)

### V1 Scope (after MVP)
- Screen-capture context detection (getDisplayMedia)
- Weekly review summaries
- Review quizzes per topic
- Topic gates based on quiz performance
- Packaging as Electron/Tauri desktop app

### Out of Scope (MVP)
- Cross-device sync
- Cloud storage
- AI/LLM tutor backend
- Keystroke logging
- Automated lab grading
- Mobile app

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Daily session completion rate | ≥1 completed session/day |
| Streak length | Building toward 30-day streak |
| Average focused minutes per session | ≥45 min (of 60 min target) |
| Log entries written | ≥1 per session |
| Topic completion percentage | Progressive, ≥1 topic/week |

---

## 8. Information Architecture

```
App
├── Dashboard          ← Today's mission, streak, quick start
├── Focus Session      ← Live timer, signals, pause reason
├── Roadmap            ← 30 ordered topics, locked/unlocked states
├── Logs               ← Daily notes, session summaries
├── Review             ← Weekly stats, focus score, quiz results
├── Settings           ← Camera, thresholds, privacy, data export
└── Onboarding         ← First-launch consent and setup
```

---

## 9. Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| False positives from focus detection | Confidence scoring + configurable grace periods |
| Privacy concerns from camera use | Local-only storage, explicit opt-in, no frame storage |
| Browser incompatibility | Chromium-first, fallback to visibility-only detection |
| Overly strict behavior causing frustration | Clear pause reasons, manual override, configurable thresholds |

---

## 10. Definition of Done (MVP)

- [ ] A session can be started and ended locally
- [ ] Focus time is recorded correctly
- [ ] Daily logs are saved and retrievable
- [ ] Streaks update automatically on session completion
- [ ] Dashboard shows progress clearly
- [ ] App remains local-first and permission-based
- [ ] All data persists across browser sessions
- [ ] Git history documents every meaningful change
- [ ] All docs/ files are current and accurate
