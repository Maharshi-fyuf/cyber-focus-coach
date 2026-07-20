/**
 * session.js — Focus Session page
 * Live timer, signal panel, webcam, pause/resume, end session form
 */

const SessionPage = {
  _timerInterval: null,
  _elapsedInterval: null,
  _topicId: null,
  _showEndForm: false,

  async render(container, params = {}) {
    await CFC_API.loadRoadmap();
    await CFC_API.loadSettings();
    await CFC_API.loadStreaks();

    const { topics, settings, sessionStatus, currentSession, sessionElapsed, sessionPaused, focusConfidence, focusSignals, dailyTargetMinutes } = CFC_STATE.getState();
    const activeTopic = params.topicId
      ? topics.find(t => t.id === parseInt(params.topicId))
      : topics.find(t => !t.is_locked && !t.is_completed) || topics[0];

    this._topicId = activeTopic?.id || 1;

    container.innerHTML = `
      ${CFC_UI.renderSidebar('session')}
      <main class="main-content">
        <div class="page-header">
          <div class="page-title"><span>⏱</span> Focus Session</div>
          <div class="page-subtitle">
            Topic: <strong style="color:var(--accent-blue)">${activeTopic?.title || 'Select a topic'}</strong>
          </div>
        </div>

        <div class="grid-2" style="gap:24px;align-items:start">
          <!-- LEFT: Timer + Controls -->
          <div>
            <div class="card mb-5" id="timer-card">
              <div class="card-title">⏱ Focus Timer</div>
              <div id="timer-ring-wrap">
                ${CFC_UI.renderFocusTimerRing(sessionElapsed, (currentSession?.plannedMinutes || dailyTargetMinutes) * 60, sessionStatus)}
              </div>

              ${sessionStatus === 'idle' ? `
                <!-- Start Controls -->
                <div class="mt-6">
                  <div class="form-group">
                    <label class="form-label">Topic</label>
                    <select class="form-select" id="topic-select">
                      ${topics.filter(t => !t.is_locked).map(t => `
                        <option value="${t.id}" ${t.id === this._topicId ? 'selected' : ''}>${t.sequence_order}. ${t.title}</option>
                      `).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Session Target</label>
                    <select class="form-select" id="target-select">
                      <option value="25">25 min (Pomodoro)</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60" selected>60 min</option>
                      <option value="90">90 min</option>
                    </select>
                  </div>
                  <button class="btn btn-primary btn-lg w-full" id="start-btn">⚡ Start Focus Session</button>
                </div>
              ` : sessionStatus === 'running' ? `
                <div class="flex gap-3 mt-6" style="justify-content:center">
                  <button class="btn btn-amber" id="manual-pause-btn">⏸ Pause</button>
                  <button class="btn btn-danger" id="end-btn">⏹ End Session</button>
                </div>
              ` : sessionStatus === 'paused' ? `
                <div style="text-align:center;margin-top:16px">
                  <div class="badge badge-amber mb-4" style="display:inline-flex;font-size:0.8rem">⚠ Session Paused</div>
                  <div class="flex gap-3" style="justify-content:center;margin-top:12px">
                    <button class="btn btn-primary" id="manual-resume-btn">↩ Resume</button>
                    <button class="btn btn-danger" id="end-btn">⏹ End Session</button>
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Focus Signals -->
            <div class="card mb-5" id="signals-card">
              <div class="card-title">📡 Focus Signals</div>
              <div id="signal-panel">
                ${CFC_UI.renderSignalPanel(focusSignals, focusConfidence)}
              </div>
            </div>

            <!-- Webcam -->
            <div class="card" id="webcam-card">
              <div class="card-title">📷 Presence Detection</div>
              <div id="webcam-wrap">
                ${CFC_UI.renderWebcamPlaceholder(settings.camera_enabled)}
              </div>
            </div>
          </div>

          <!-- RIGHT: Topic + Hints + Quiz -->
          <div>
            ${activeTopic ? `
              <div class="card mb-5">
                <div class="card-title">🎯 Current Topic</div>
                <div class="badge badge-blue mb-4">${activeTopic.category || ''}</div>
                <h3 style="font-family:var(--font-mono);font-size:1.1rem;color:var(--text-primary);margin:8px 0">${activeTopic.title}</h3>
                <p class="text-sm text-muted" style="line-height:1.7;margin-bottom:16px">${activeTopic.description || ''}</p>
                <div class="flex gap-2 flex-wrap">
                  <span class="badge badge-amber">⏰ Est. ${activeTopic.estimated_days} days</span>
                  <span class="badge badge-${activeTopic.is_completed ? 'green' : activeTopic.is_locked ? 'purple' : 'blue'}">${activeTopic.is_completed ? '✓ Completed' : activeTopic.is_locked ? '🔒 Locked' : '▶ Active'}</span>
                </div>
                ${!activeTopic.is_completed ? `
                  <div class="separator"></div>
                  <button class="btn btn-ghost btn-sm" id="complete-topic-btn" data-topic="${activeTopic.id}">✓ Mark Topic Complete</button>
                ` : ''}
              </div>

              <!-- Tutor Hints -->
              <div class="mb-5">
                ${CFC_UI.renderTutorHint(activeTopic.id)}
              </div>

              <!-- Quizzes for this topic -->
              <div id="quiz-section">
                <!-- Loaded async -->
              </div>
            ` : `
              <div class="card">
                <div class="empty-state">
                  <div class="empty-state-icon">🎯</div>
                  <div class="empty-state-title">No active topic</div>
                  <div class="empty-state-desc">Visit the Roadmap to unlock your next topic.</div>
                  <button class="btn btn-ghost" onclick="CFC_ROUTER.navigate('roadmap')">Go to Roadmap →</button>
                </div>
              </div>
            `}
          </div>
        </div>

        <!-- End Session Form (hidden initially) -->
        <div id="end-session-form" class="hidden">
          ${this._renderEndForm()}
        </div>

        <!-- Pause Modal -->
        <div id="pause-modal-root"></div>
      </main>
    `;

    // Load quizzes for this topic
    if (activeTopic) {
      CFC_API.loadQuizzes(activeTopic.id).then(quizzes => {
        const section = container.querySelector('#quiz-section');
        if (!section || quizzes.length === 0) return;
        section.innerHTML = quizzes.slice(0, 2).map(q => CFC_UI.renderQuizCard(q)).join('');
        this._attachQuizListeners(container, quizzes);
      });
    }

    // Attach webcam if camera enabled
    if (settings.camera_enabled) {
      setTimeout(() => CFC_UI.attachWebcamStream(), 300);
    }

    this._attachListeners(container);
    this._startSignalUpdates(container);
    this._startTimerUI(container);

    // If session is already running (navigated away and back), restore
    if (sessionStatus === 'running' || sessionStatus === 'paused') {
      this._startTimerUI(container);
    }
  },

  _renderEndForm() {
    const { topics } = CFC_STATE.getState();
    return `
      <div class="card session-end-form" style="margin-top:24px;border-color:rgba(0,255,136,0.3)">
        <div class="card-title">📝 Session Wrap-Up</div>
        <p class="text-sm text-muted mb-6">Take 2 minutes to reflect on what you learned. This builds long-term retention.</p>
        <div class="form-group">
          <label class="form-label">What did you study? (summary)</label>
          <textarea class="form-textarea" id="end-notes" placeholder="I learned about… I practiced… I struggled with…"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Win of the session 🏆</label>
          <input class="form-input" id="end-wins" type="text" placeholder="Something I figured out or understood well…" />
        </div>
        <div class="form-group">
          <label class="form-label">Blocker / Confusion ⚠</label>
          <input class="form-input" id="end-blockers" type="text" placeholder="What slowed me down or confused me…" />
        </div>
        <div class="form-group">
          <label class="form-label">Next step →</label>
          <input class="form-input" id="end-next" type="text" placeholder="Tomorrow I'll start with…" />
        </div>
        <div class="flex gap-3 mt-4">
          <button class="btn btn-primary" id="save-session-btn">💾 Save & End Session</button>
          <button class="btn btn-ghost" id="cancel-end-btn">Cancel</button>
        </div>
      </div>
    `;
  },

  _attachListeners(container) {
    const qs = id => container.querySelector(id);

    // START
    qs('#start-btn')?.addEventListener('click', async () => {
      const topicId    = parseInt(qs('#topic-select')?.value || this._topicId);
      const plannedMin = parseInt(qs('#target-select')?.value || 60);
      this._topicId = topicId;
      try {
        await CFC_API.startSession(topicId, plannedMin);
        const { settings } = CFC_STATE.getState();
        await CFC_FOCUS.start({
          camera_enabled:        settings.camera_enabled,
          focus_threshold:       settings.focus_threshold,
          idle_threshold_seconds:settings.idle_threshold_seconds,
          grace_period_seconds:  settings.grace_period_seconds,
        });
        showToast('⚡ Session started! Stay focused.');
        await SessionPage.render(container, { topicId });
      } catch (err) {
        showToast('Failed to start session: ' + err.message, 'error');
      }
    });

    // MANUAL PAUSE
    qs('#manual-pause-btn')?.addEventListener('click', async () => {
      await CFC_API.pauseSession('Manual pause by user');
      CFC_STATE.setState({ sessionStatus: 'paused', pauseReason: { icon: '⏸', title: 'Manually Paused', reason: 'You paused the session. Click <strong>Resume</strong> when you\'re ready to continue.' }, showPauseModal: true });
      this._showPauseModal(container);
    });

    // MANUAL RESUME
    qs('#manual-resume-btn')?.addEventListener('click', async () => {
      await CFC_API.resumeSession();
      const modal = container.querySelector('#pause-modal');
      if (modal) modal.remove();
      await SessionPage.render(container, { topicId: this._topicId });
    });

    // END
    qs('#end-btn')?.addEventListener('click', () => {
      const form = qs('#end-session-form');
      if (form) {
        form.classList.remove('hidden');
        form.scrollIntoView({ behavior: 'smooth' });
        this._attachEndFormListeners(container);
      }
    });

    // COMPLETE TOPIC
    qs('#complete-topic-btn')?.addEventListener('click', async (e) => {
      const topicId = parseInt(e.currentTarget.dataset.topic);
      await CFC_API.completeTopic(topicId);
      await SessionPage.render(container, { topicId: this._topicId });
    });

    // Focus engine events
    document.addEventListener('cfc:session-paused', (e) => {
      CFC_STATE.setState({ pauseReason: e.detail, showPauseModal: true });
      this._showPauseModal(container);
    });
    document.addEventListener('cfc:session-resumed', () => {
      const modal = container.querySelector('#pause-modal');
      if (modal) modal.remove();
    });
  },

  _attachEndFormListeners(container) {
    const qs = id => container.querySelector(id);
    qs('#save-session-btn')?.addEventListener('click', async () => {
      const notes    = qs('#end-notes')?.value || '';
      const wins     = qs('#end-wins')?.value || '';
      const blockers = qs('#end-blockers')?.value || '';
      const nextStep = qs('#end-next')?.value || '';
      const result   = await CFC_API.endSession(notes, '', wins, blockers, nextStep);
      this._stopIntervals();
      showToast(`✅ Session saved! ${result?.focusedMinutes || 0}m focused.`);
      CFC_ROUTER.navigate('dashboard');
    });
    qs('#cancel-end-btn')?.addEventListener('click', () => {
      const form = container.querySelector('#end-session-form');
      if (form) form.classList.add('hidden');
    });
  },

  _attachQuizListeners(container, quizzes) {
    container.querySelectorAll('.quiz-option').forEach(opt => {
      opt.addEventListener('click', async (e) => {
        const quizId = e.currentTarget.dataset.quiz;
        const selected = parseInt(e.currentTarget.dataset.option);
        const quiz = quizzes.find(q => q.id === quizId);
        if (!quiz) return;
        // Check if already answered
        if (container.querySelector(`#quiz-${quizId} .quiz-result`)) return;
        const result = await CFC_API.attemptQuiz(quizId, selected);
        const section = container.querySelector(`#quiz-${quizId}`);
        if (section) {
          section.outerHTML = CFC_UI.renderQuizCard(quiz, selected);
        }
      });
    });
  },

  _showPauseModal(container) {
    const { pauseReason } = CFC_STATE.getState();
    const root = container.querySelector('#pause-modal-root');
    if (!root || !pauseReason) return;
    root.innerHTML = CFC_UI.renderPauseModal(pauseReason);
    root.querySelector('#manual-resume-btn')?.addEventListener('click', async () => {
      await CFC_API.resumeSession();
      root.innerHTML = '';
    });
    root.querySelector('#end-early-btn')?.addEventListener('click', () => {
      root.innerHTML = '';
      const form = container.querySelector('#end-session-form');
      if (form) { form.classList.remove('hidden'); form.scrollIntoView({ behavior: 'smooth' }); this._attachEndFormListeners(container); }
    });
  },

  _startSignalUpdates(container) {
    this._signalInterval = setInterval(() => {
      if (document.body.contains(container.firstChild) === false) { clearInterval(this._signalInterval); return; }
      const { focusSignals, focusConfidence } = CFC_STATE.getState();
      const panel = container.querySelector('#signal-panel');
      if (panel) panel.innerHTML = CFC_UI.renderSignalPanel(focusSignals, focusConfidence);
    }, 1000);
  },

  _startTimerUI(container) {
    if (this._timerInterval) clearInterval(this._timerInterval);
    this._timerInterval = setInterval(() => {
      const { sessionStatus, currentSession, dailyTargetMinutes } = CFC_STATE.getState();
      if (!currentSession || sessionStatus === 'idle') return;

      if (sessionStatus === 'running') {
        CFC_STATE.setState(s => ({ sessionElapsed: s.sessionElapsed + 1 }));
      } else if (sessionStatus === 'paused') {
        CFC_STATE.setState(s => ({ sessionPaused: s.sessionPaused + 1 }));
      }

      const { sessionElapsed } = CFC_STATE.getState();
      const total = (currentSession.plannedMinutes || dailyTargetMinutes) * 60;
      const ring = container.querySelector('#timer-ring-wrap');
      if (ring) ring.innerHTML = CFC_UI.renderFocusTimerRing(sessionElapsed, total, sessionStatus);

      // Auto-end if time is up
      if (sessionStatus === 'running' && sessionElapsed >= total) {
        showToast('🎉 Session complete! Target reached.');
        const form = container.querySelector('#end-session-form');
        if (form) { form.classList.remove('hidden'); form.scrollIntoView({ behavior: 'smooth' }); this._attachEndFormListeners(container); }
      }

      // Update sidebar streak badge
      const sidebarBadge = container.querySelector('.streak-count');
      if (sidebarBadge) {
        const { streaks } = CFC_STATE.getState();
        sidebarBadge.textContent = streaks.current_streak_days;
      }
    }, 1000);
  },

  _stopIntervals() {
    if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
    if (this._signalInterval) { clearInterval(this._signalInterval); this._signalInterval = null; }
  },

  destroy() { this._stopIntervals(); },
};

window.SessionPage = SessionPage;
