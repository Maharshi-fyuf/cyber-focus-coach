# App Flow Diagrams
## Cyber Focus Coach

---

## 1. First Launch Flow

```
Open app at localhost:5173
        │
        ▼
Is this first launch?
(no user in DB)
        │
    YES ▼
Onboarding Step 1: Welcome + Privacy Explanation
        │
        ▼
Onboarding Step 2: Grant Camera Permission (optional)
        │
        ▼
Onboarding Step 3: Set Daily Target (default: 60 min)
        │
        ▼
Onboarding Step 4: Pick Starting Topic
        │
        ▼
Save user record to DB
        │
        ▼
Redirect → Dashboard
```

---

## 2. Daily Session Flow

```
User opens Dashboard
        │
        ▼
Dashboard shows:
  - Today's active topic
  - Progress toward daily goal
  - Current streak
  - Quick Start button
        │
        ▼
User clicks "Start Focus Session"
        │
        ▼
Session Page opens
  - User selects topic (pre-selected based on roadmap)
  - User sets session duration (default: 60 min)
        │
        ▼
User clicks "Start"
        │
        ├─► POST /api/session/start → DB record created
        ├─► Focus Engine begins sampling (every 1s)
        │     ├─ Tab visibility checked
        │     ├─ Cursor idle timer starts
        │     └─ Camera activated (if enabled)
        ▼
Timer running...
  - Elapsed time shown in animated ring
  - Focus confidence score displayed live
  - Signal panel shows real-time signal status
        │
        ├── [Focus drops below threshold for > grace period]
        │         │
        │         ▼
        │   Timer PAUSED
        │   Pause Modal appears:
        │     - Why it paused (specific reason)
        │     - What to do to resume
        │     - "Return to Focus" button
        │         │
        │   [User returns to focus]
        │         │
        │         ▼
        │   Timer AUTO-RESUMES
        │   (or user clicks Resume)
        │
        ├── [User manually pauses]
        │         │
        │         ▼
        │   Timer PAUSED (manual)
        │   Same modal, different message
        │
        └── [Target duration reached OR user clicks End]
                  │
                  ▼
            Session End Flow (below)
```

---

## 3. Session End Flow

```
Session ends
        │
        ▼
Session End Form appears:
  - Notes (what did you study?)
  - Win (what went well?)
  - Blocker (what was difficult?)
  - Next step (what to do tomorrow?)
        │
        ▼
User fills in form and clicks "Save"
        │
        ├─► POST /api/session/end
        │     - Saves session record (focused_minutes, paused_minutes, score)
        │     - Saves artifact (notes, reflection)
        ├─► POST /api/logs
        │     - Saves daily log entry
        ├─► Streak computation runs
        │     - Was daily target met?
        │     - Was yesterday also active? → increment streak
        │     - Otherwise → reset to 1
        │     - Update best streak if needed
        │
        ▼
Redirect → Dashboard
  - Updated stats visible
  - Streak updated
  - Topic progress shown
```

---

## 4. Roadmap Navigation Flow

```
User opens Roadmap page
        │
        ▼
Topics displayed in sequence (1–30)
  ✓ = completed (green)
  ▶ = active/unlocked (blue)
  🔒 = locked (dimmed)
        │
User clicks a topic
        │
        ▼
Detail panel shows:
  - Topic description
  - Estimated time
  - Study resources
  - Tutor hints (collapsed)
  - "Study This Topic" button
  - "Mark Complete" button (if active)
        │
User clicks "Study This Topic"
        │
        ▼
Session Page with topic pre-selected
```

---

## 5. Focus Signal Evaluation (Every 1 Second)

```
Focus Engine tick (every 1000ms)
        │
        ▼
Collect signals:
  tab_visible    = document.visibilityState === 'visible'
  cursor_active  = lastMouseMove < idle_threshold_seconds ago
  camera_present = face detection result (if enabled)
        │
        ▼
Compute confidence score:
  score = 0
  if tab_visible:    score += 20
  else:              score -= 50
  if cursor_active:  score += 15
  else:              score -= 30
  if cam enabled:
    if face_present:  score += 40
      if face_fwd:    score += 25
    else:             score -= 40
  score = clamp(score, 0, 100)
        │
        ▼
Update UI (live):
  - Confidence meter
  - Signal indicators
        │
        ▼
Is session running?
  NO → stop
  YES →
        ├── score >= threshold → grace_timer = 0, continue
        └── score < threshold  → grace_timer++
                  │
                  └── grace_timer > grace_period_seconds?
                            YES → pause session
                            NO  → continue (grace period active)
```
