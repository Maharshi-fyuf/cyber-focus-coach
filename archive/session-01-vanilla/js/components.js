/**
 * components.js — Shared UI components (render functions)
 * All components return HTML strings or DOM elements
 */

/* ================================================================
   SIDEBAR / NAV
   ================================================================ */
function renderSidebar(activePage) {
  const { streaks, sessionStatus, userName } = CFC_STATE.getState();
  const nav = [
    { id: 'dashboard', icon: '⬡', label: 'Dashboard' },
    { id: 'session',   icon: '⏱', label: 'Focus Session' },
    { id: 'roadmap',   icon: '🗺', label: 'Roadmap' },
    { id: 'logs',      icon: '📋', label: 'Logs' },
    { id: 'review',    icon: '📊', label: 'Review' },
    { id: 'settings',  icon: '⚙', label: 'Settings' },
  ];

  const isRunning = sessionStatus === 'running';

  return `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-text">&lt;CyberFocus/&gt;</span>
        <span class="logo-sub">COACH v1.0</span>
      </div>
      <nav class="nav-section">
        <div class="nav-label">Navigation</div>
        ${nav.map(item => `
          <div class="nav-link ${activePage === item.id ? 'active' : ''}" data-nav="${item.id}">
            <span class="nav-icon">${item.icon}</span>
            ${item.label}
            ${item.id === 'session' && isRunning ? '<span class="status-dot active" style="margin-left:auto"></span>' : ''}
          </div>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <div class="streak-badge">
          <span class="streak-flame">🔥</span>
          <div>
            <div><span class="streak-count">${streaks.current_streak_days}</span> day streak</div>
            <div class="streak-label">Best: ${streaks.best_streak_days} days</div>
          </div>
        </div>
      </div>
    </aside>
  `;
}

/* ================================================================
   FOCUS TIMER RING
   ================================================================ */
function renderFocusTimerRing(elapsedSeconds, totalSeconds, status) {
  const radius = 96;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? Math.min(elapsedSeconds / totalSeconds, 1) : 0;
  const offset    = circumference * (1 - progress);
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timeStr = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;

  const remainMins = Math.max(0, Math.ceil((totalSeconds - elapsedSeconds) / 60));
  const statusText = status === 'running' ? 'FOCUSED' : status === 'paused' ? 'PAUSED' : 'READY';

  return `
    <div class="focus-timer-wrap">
      <div class="timer-ring-container">
        <svg class="timer-ring-svg" viewBox="0 0 220 220">
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#00ff88" />
              <stop offset="100%" stop-color="#0af3ff" />
            </linearGradient>
          </defs>
          <circle class="timer-ring-track" cx="110" cy="110" r="${radius}" />
          <circle class="timer-ring-fill"
            cx="110" cy="110" r="${radius}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"
          />
        </svg>
        <div class="timer-center">
          <div class="timer-time" id="timer-display">${timeStr}</div>
          <div class="timer-label">${remainMins > 0 ? remainMins + 'm left' : 'TARGET MET'}</div>
        </div>
      </div>
      <div class="timer-status-ring ${status}">${statusText}</div>
    </div>
  `;
}

/* ================================================================
   FOCUS SIGNAL PANEL
   ================================================================ */
function renderSignalPanel(signals, confidence) {
  const getClass = (val) => val === true ? 'active' : val === false ? 'danger' : 'warning';
  const getLabel = (val, trueLabel, falseLabel, nullLabel = 'N/A') =>
    val === true ? trueLabel : val === false ? falseLabel : nullLabel;

  const confClass = confidence >= 70 ? 'high' : confidence >= 40 ? 'mid' : 'low';
  const confColor = confidence >= 70 ? '#00ff88' : confidence >= 40 ? '#f59e0b' : '#ff4757';

  return `
    <div class="confidence-display mb-4">
      <div class="confidence-score ${confClass}">${confidence}</div>
      <div class="confidence-meta">
        <div class="confidence-label">Focus Confidence</div>
        <div class="confidence-track">
          <div class="confidence-track-fill" style="width:${confidence}%;background:${confColor}"></div>
        </div>
        <div class="text-xs text-muted mt-4">${
          confidence >= 70 ? '🟢 Strong focus detected' :
          confidence >= 40 ? '🟡 Marginal focus — stay on task' :
                              '🔴 Low focus — timer will pause soon'
        }</div>
      </div>
    </div>
    <div class="signal-panel">
      <div class="signal-item ${signals.tabVisible ? 'active' : 'danger'}">
        <div class="signal-name">Tab Visibility</div>
        <div class="signal-value ${signals.tabVisible ? 'ok' : 'fail'}">
          ${signals.tabVisible ? '✓ Active' : '✕ Hidden'}
        </div>
        <div class="confidence-bar-wrap">
          <div class="confidence-bar-fill" style="width:${signals.tabVisible ? 100 : 0}%;background:${signals.tabVisible ? 'var(--primary)' : 'var(--accent-red)'}"></div>
        </div>
      </div>
      <div class="signal-item ${signals.cursorActive ? 'active' : 'warning'}">
        <div class="signal-name">Cursor Activity</div>
        <div class="signal-value ${signals.cursorActive ? 'ok' : 'warn'}">
          ${signals.cursorActive ? '✓ Moving' : '⚡ Idle'}
        </div>
        <div class="confidence-bar-wrap">
          <div class="confidence-bar-fill" style="width:${signals.cursorActive ? 100 : 20}%;background:${signals.cursorActive ? 'var(--primary)' : 'var(--accent-amber)'}"></div>
        </div>
      </div>
      <div class="signal-item ${getClass(signals.cameraPresent)}">
        <div class="signal-name">Camera Presence</div>
        <div class="signal-value ${signals.cameraPresent === true ? 'ok' : signals.cameraPresent === false ? 'fail' : ''}">
          ${getLabel(signals.cameraPresent, '✓ Face Detected', '✕ No Face', '— Disabled')}
        </div>
        <div class="confidence-bar-wrap">
          <div class="confidence-bar-fill" style="width:${signals.cameraPresent === true ? 100 : signals.cameraPresent === false ? 0 : 50}%;background:${signals.cameraPresent === true ? 'var(--primary)' : signals.cameraPresent === false ? 'var(--accent-red)' : 'var(--text-muted)'}"></div>
        </div>
      </div>
      <div class="signal-item ${getClass(signals.faceForward)}">
        <div class="signal-name">Face Forward</div>
        <div class="signal-value ${signals.faceForward === true ? 'ok' : signals.faceForward === false ? 'warn' : ''}">
          ${getLabel(signals.faceForward, '✓ On-Screen', '⚡ Look Away', '— N/A')}
        </div>
        <div class="confidence-bar-wrap">
          <div class="confidence-bar-fill" style="width:${signals.faceForward === true ? 100 : signals.faceForward === false ? 30 : 50}%;background:${signals.faceForward === true ? 'var(--primary)' : 'var(--text-muted)'}"></div>
        </div>
      </div>
    </div>
  `;
}

/* ================================================================
   PAUSE MODAL
   ================================================================ */
function renderPauseModal(reason) {
  if (!reason) return '';
  return `
    <div class="modal-backdrop" id="pause-modal">
      <div class="modal-box">
        <div class="modal-icon">${reason.icon}</div>
        <div class="modal-title">${reason.title}</div>
        <div class="modal-reason">${reason.reason}</div>
        <div class="modal-actions">
          <button class="btn btn-primary" id="manual-resume-btn">↩ Return to Focus</button>
          <button class="btn btn-ghost" id="end-early-btn">End Session</button>
        </div>
      </div>
    </div>
  `;
}

/* ================================================================
   WEBCAM PREVIEW
   ================================================================ */
function renderWebcamPlaceholder(cameraEnabled) {
  if (!cameraEnabled) {
    return `
      <div class="webcam-container" style="min-height:120px;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.3)">
        <div class="text-center text-muted">
          <div style="font-size:2rem">📷</div>
          <div class="text-xs font-mono mt-4">Camera disabled</div>
          <div class="text-xs text-muted">Enable in Settings</div>
        </div>
      </div>
    `;
  }
  return `
    <div class="webcam-container" id="webcam-wrap">
      <video id="webcam-video" class="webcam-video" autoplay muted playsinline style="width:100%;max-height:180px"></video>
      <div class="webcam-overlay">
        <div class="webcam-corner tl"></div>
        <div class="webcam-corner tr"></div>
        <div class="webcam-corner bl"></div>
        <div class="webcam-corner br"></div>
        <div class="webcam-status-bar">
          <div class="webcam-rec-dot"></div>
          <span id="webcam-label">DETECTING</span>
        </div>
      </div>
    </div>
  `;
}

function attachWebcamStream() {
  const video = document.getElementById('webcam-video');
  if (!video) return;
  const stream = window._cfcCameraStream;
  if (stream) {
    video.srcObject = stream;
  } else {
    document.addEventListener('cfc:camera-ready', () => {
      const v = document.getElementById('webcam-video');
      if (v && window._cfcCameraStream) v.srcObject = window._cfcCameraStream;
    }, { once: true });
  }
}

/* ================================================================
   STREAK CARD
   ================================================================ */
function renderStreakCard(streaks) {
  return `
    <div class="card">
      <div class="card-title">🔥 Current Streak</div>
      <div class="streak-display">
        <div class="streak-fire-wrap">🔥</div>
        <div class="streak-number">${streaks.current_streak_days}</div>
        <div class="label">days in a row</div>
        <div class="streak-best">Best: ${streaks.best_streak_days} days</div>
      </div>
    </div>
  `;
}

/* ================================================================
   ROADMAP TRACK
   ================================================================ */
function renderRoadmapTrack(topics, activePage = false) {
  if (!topics || topics.length === 0) {
    return `<div class="empty-state"><div class="empty-state-icon">🗺</div><div class="empty-state-title">No topics loaded</div></div>`;
  }
  const limit = activePage ? topics.length : 5;
  const shown = topics.slice(0, limit);
  return `
    <div class="roadmap-track">
      ${shown.map(topic => {
        const state = topic.is_completed ? 'completed' : !topic.is_locked ? 'active' : 'locked';
        const stateIcon = topic.is_completed ? '✓' : topic.is_locked ? '🔒' : topic.sequence_order;
        return `
          <div class="roadmap-node ${state}" data-topic="${topic.id}">
            <div class="roadmap-node-dot">${stateIcon}</div>
            <div class="roadmap-node-card">
              <div class="roadmap-node-title">${topic.title}</div>
              <div class="roadmap-node-desc">${topic.description ? topic.description.substring(0,80) + '…' : ''}</div>
              <div class="roadmap-node-meta">
                <span class="badge badge-${state === 'completed' ? 'green' : state === 'active' ? 'blue' : 'purple'}">${state.toUpperCase()}</span>
                <span class="badge badge-amber">${topic.estimated_days}d</span>
                <span class="text-xs text-muted">${topic.category || ''}</span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/* ================================================================
   QUIZ CARD
   ================================================================ */
function renderQuizCard(quiz, attempt = null) {
  const opts = ['option_a','option_b','option_c','option_d'];
  const keys = ['A','B','C','D'];
  return `
    <div class="card quiz-card" id="quiz-${quiz.id}">
      <div class="card-title">❓ Knowledge Check</div>
      <div class="quiz-question">${quiz.question}</div>
      <div class="quiz-options">
        ${opts.map((opt, i) => {
          let cls = '';
          if (attempt !== null) {
            if (i === quiz.correct_option) cls = 'correct';
            else if (i === attempt && i !== quiz.correct_option) cls = 'wrong';
          }
          return `
            <div class="quiz-option ${attempt !== null ? '' : ''} ${cls}" data-quiz="${quiz.id}" data-option="${i}">
              <span class="quiz-key">${keys[i]}</span>
              ${quiz[opt]}
            </div>
          `;
        }).join('')}
      </div>
      ${attempt !== null ? `
        <div class="quiz-result ${attempt === quiz.correct_option ? 'correct' : 'wrong'}">
          ${attempt === quiz.correct_option ? '✅ Correct!' : '❌ Incorrect'}
          <div class="quiz-explanation">${quiz.explanation}</div>
        </div>
      ` : ''}
    </div>
  `;
}

/* ================================================================
   TUTOR HINT
   ================================================================ */
function renderTutorHint(topicId) {
  const hints = TUTOR_HINTS[topicId] || ['Study this topic carefully and take notes.'];
  return `
    <div class="card">
      <div class="card-title">🤖 AI Tutor Hints</div>
      <div class="text-xs text-muted mb-4" style="font-family:var(--font-mono)">Expand hints one at a time. Try to solve it yourself first!</div>
      ${hints.map((hint, i) => `
        <div class="tutor-hint-wrap mb-4">
          <div class="tutor-hint-header" onclick="this.nextElementSibling.classList.toggle('open')">
            <span>💡 Hint ${i + 1}${i === 0 ? ' (Try This First)' : i === hints.length - 1 ? ' (Full Explanation)' : ''}</span>
            <span>▾</span>
          </div>
          <div class="tutor-hint-body">${hint}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ================================================================
   STAT BOX
   ================================================================ */
function renderStatBox(icon, value, label, sub = '', colorClass = '') {
  return `
    <div class="stat-box">
      <div class="stat-box-icon">${icon}</div>
      <div class="stat-box-value ${colorClass}">${value}</div>
      <div class="stat-box-label">${label}</div>
      ${sub ? `<div class="stat-box-sub">${sub}</div>` : ''}
    </div>
  `;
}

/* ================================================================
   LOG ENTRY
   ================================================================ */
function renderLogEntry(log, topics) {
  const topic = topics.find(t => t.id === log.topic_id);
  const date  = new Date(log.log_date + 'T12:00:00').toLocaleDateString('en-US', { weekday:'short', year:'numeric', month:'short', day:'numeric' });
  return `
    <div class="log-entry">
      <div class="log-entry-date">${date}</div>
      <div class="log-entry-topic">${topic ? topic.title : 'Unknown Topic'}</div>
      ${log.summary ? `<div class="log-entry-summary">${log.summary}</div>` : ''}
      <div class="log-entry-meta">
        ${log.wins ? `<span class="badge badge-green">✓ Win: ${log.wins.substring(0,40)}</span>` : ''}
        ${log.blockers ? `<span class="badge badge-red">⚠ Blocker</span>` : ''}
        ${log.next_step ? `<span class="badge badge-blue">→ ${log.next_step.substring(0,30)}</span>` : ''}
      </div>
    </div>
  `;
}

window.CFC_UI = {
  renderSidebar, renderFocusTimerRing, renderSignalPanel, renderPauseModal,
  renderWebcamPlaceholder, attachWebcamStream, renderStreakCard, renderRoadmapTrack,
  renderQuizCard, renderTutorHint, renderStatBox, renderLogEntry,
};
