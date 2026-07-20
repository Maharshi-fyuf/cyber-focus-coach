/**
 * onboarding.js — First-launch setup wizard
 * Steps: Welcome → Privacy → Camera → Target → Done
 */

const OnboardingPage = {
  _step: 0,
  _cameraGranted: false,
  _targetMinutes: 60,
  _name: 'Hacker',
  _topicId: 1,

  async render(container) {
    this._step = 0;
    this._renderStep(container);
  },

  _renderStep(container) {
    const steps = ['Welcome', 'Privacy', 'Camera', 'Target', 'Go!'];
    const dots = steps.map((_, i) =>
      `<div class="onboarding-step-dot ${i === this._step ? 'active' : i < this._step ? 'done' : ''}"></div>`
    ).join('');

    const content = this._getStepContent();
    container.innerHTML = `
      <div class="onboarding-wrap">
        <div class="onboarding-card">
          <div class="onboarding-step-indicator">${dots}</div>
          ${content}
        </div>
      </div>
    `;
    this._attachListeners(container);
  },

  _getStepContent() {
    switch (this._step) {
      case 0: return `
        <div class="onboarding-title">&lt;Cyber Focus Coach/&gt;</div>
        <div class="onboarding-subtitle">
          Your personal cybersecurity study accountability system.<br>
          Stay focused. Track progress. Build streaks. Level up.
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;margin:24px 0">
          <div class="privacy-notice">
            <div class="privacy-notice-title">🔒 Local First</div>
            <p>Everything stays on your device. No cloud, no tracking, no accounts. Your study data is yours.</p>
          </div>
          <div class="privacy-notice">
            <div class="privacy-notice-title">⏱ Focus Detection</div>
            <p>The app tracks tab visibility and cursor activity. Camera is <strong>optional</strong> and requires your explicit permission.</p>
          </div>
          <div class="privacy-notice">
            <div class="privacy-notice-title">📚 30-Topic Roadmap</div>
            <p>Structured cybersecurity learning path from Networking basics to Bug Bounty — with quizzes and tutor hints.</p>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">What should I call you?</label>
          <input class="form-input" id="ob-name" type="text" placeholder="Hacker" value="Hacker" maxlength="30" />
        </div>
        <div class="onboarding-actions">
          <button class="btn btn-primary btn-lg" id="ob-next">Get Started →</button>
        </div>
      `;

      case 1: return `
        <div class="onboarding-title">Privacy First</div>
        <div class="onboarding-subtitle">Here's exactly what Cyber Focus Coach collects — and what it doesn't.</div>
        <div style="display:flex;flex-direction:column;gap:10px;margin:20px 0">
          ${[
            ['✅', 'Tab visibility state (active / hidden)'],
            ['✅', 'Cursor movement (active / idle)'],
            ['✅', 'Session start/end times and focused minutes'],
            ['✅', 'Your notes and daily log entries'],
            ['✅', 'Roadmap progress and quiz answers'],
            ['✅', 'Optional: camera face-presence (no frames stored)'],
          ].map(([icon, text]) => `
            <div style="display:flex;gap:10px;align-items:center;font-family:var(--font-mono);font-size:0.8rem;color:var(--text-secondary)">
              <span>${icon}</span><span>${text}</span>
            </div>
          `).join('')}
          <div class="separator"></div>
          ${[
            ['❌', 'No covert surveillance'],
            ['❌', 'No keystroke logging'],
            ['❌', 'No cloud storage or sync'],
            ['❌', 'No background tracking'],
          ].map(([icon, text]) => `
            <div style="display:flex;gap:10px;align-items:center;font-family:var(--font-mono);font-size:0.8rem;color:var(--text-muted)">
              <span>${icon}</span><span>${text}</span>
            </div>
          `).join('')}
        </div>
        <div class="onboarding-actions">
          <button class="btn btn-ghost" id="ob-back">← Back</button>
          <button class="btn btn-primary" id="ob-next">I Understand →</button>
        </div>
      `;

      case 2: return `
        <div class="onboarding-title">Camera (Optional)</div>
        <div class="onboarding-subtitle">Enable webcam for face-presence detection. This improves focus accuracy but is completely optional.</div>
        <div class="privacy-notice" style="margin:20px 0">
          <div class="privacy-notice-title">📷 Camera Privacy</div>
          <p>Camera frames are <strong>never stored</strong>. The app only detects whether a face is present in real-time. You can disable this at any time in Settings.</p>
        </div>
        <div id="camera-status" style="text-align:center;padding:20px;font-family:var(--font-mono);color:var(--text-muted)">
          ${this._cameraGranted
            ? `<div style="color:var(--primary)">✓ Camera access granted!</div>`
            : `<div>Camera not yet enabled</div>`}
        </div>
        <div class="onboarding-actions">
          <button class="btn btn-ghost" id="ob-back">← Back</button>
          ${!this._cameraGranted
            ? `<button class="btn btn-amber" id="ob-camera">Enable Camera</button>`
            : ``}
          <button class="btn btn-primary" id="ob-next">${this._cameraGranted ? 'Next →' : 'Skip →'}</button>
        </div>
      `;

      case 3: return `
        <div class="onboarding-title">Daily Target</div>
        <div class="onboarding-subtitle">How many minutes of focused cybersecurity study do you commit to each day?</div>
        <div style="margin:30px 0">
          <div class="form-group">
            <label class="form-label">Daily Focus Target</label>
            <select class="form-select" id="ob-target">
              <option value="30">30 minutes (Light)</option>
              <option value="45">45 minutes (Moderate)</option>
              <option value="60" selected>60 minutes (Recommended)</option>
              <option value="90">90 minutes (Intensive)</option>
              <option value="120">120 minutes (Full-time)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Start with Topic</label>
            <select class="form-select" id="ob-topic">
              ${window.ROADMAP_TOPICS.map(t => `<option value="${t.id}">${t.id}. ${t.title}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="onboarding-actions">
          <button class="btn btn-ghost" id="ob-back">← Back</button>
          <button class="btn btn-primary" id="ob-next">Save →</button>
        </div>
      `;

      case 4: return `
        <div style="text-align:center">
          <div style="font-size:4rem;margin-bottom:16px">🚀</div>
          <div class="onboarding-title">You're Ready!</div>
          <div class="onboarding-subtitle">
            Your study coach is configured. Start your first session<br>and build that streak!
          </div>
          <div style="margin:30px 0;display:flex;flex-direction:column;gap:8px">
            <div class="badge badge-green" style="justify-content:center;padding:8px 16px;font-size:0.8rem">
              👤 ${this._name}
            </div>
            <div class="badge badge-blue" style="justify-content:center;padding:8px 16px;font-size:0.8rem">
              ⏱ ${this._targetMinutes} minute daily target
            </div>
            <div class="badge badge-purple" style="justify-content:center;padding:8px 16px;font-size:0.8rem">
              📚 Starting: ${window.ROADMAP_TOPICS.find(t => t.id == this._topicId)?.title || 'Topic 1'}
            </div>
          </div>
          <button class="btn btn-primary btn-lg" id="ob-finish">Launch Dashboard →</button>
        </div>
      `;
    }
  },

  _attachListeners(container) {
    const nextBtn = container.querySelector('#ob-next');
    const backBtn = container.querySelector('#ob-back');
    const camBtn  = container.querySelector('#ob-camera');
    const finBtn  = container.querySelector('#ob-finish');

    if (nextBtn) nextBtn.addEventListener('click', () => this._handleNext(container));
    if (backBtn) backBtn.addEventListener('click', () => { this._step--; this._renderStep(container); });
    if (finBtn)  finBtn.addEventListener('click',  () => this._handleFinish());
    if (camBtn)  camBtn.addEventListener('click',  () => this._requestCamera(container));
  },

  async _handleNext(container) {
    if (this._step === 0) {
      const nameInput = container.querySelector('#ob-name');
      this._name = (nameInput?.value?.trim()) || 'Hacker';
    }
    if (this._step === 3) {
      const target = container.querySelector('#ob-target');
      const topic  = container.querySelector('#ob-topic');
      this._targetMinutes = parseInt(target?.value || 60);
      this._topicId       = parseInt(topic?.value || 1);
    }
    this._step++;
    this._renderStep(container);
  },

  async _requestCamera(container) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop()); // Stop preview, engine will reopen
      this._cameraGranted = true;
      await CFC_API.saveSettings({ camera_enabled: true });
      this._renderStep(container);
    } catch (err) {
      const status = container.querySelector('#camera-status');
      if (status) status.innerHTML = `<div style="color:var(--accent-red)">Camera permission denied. You can enable it later in Settings.</div>`;
    }
  },

  async _handleFinish() {
    // Save user profile
    await CFC_API.updateUserProfile(this._name, this._targetMinutes);
    // Unlock selected starting topic
    await CFC_API.unlockTopic(this._topicId);
    // Mark onboarding complete
    localStorage.setItem('cfc_onboarding_done', '1');
    localStorage.setItem('cfc_active_topic', this._topicId);
    CFC_STATE.setState({ onboardingComplete: true, userName: this._name, dailyTargetMinutes: this._targetMinutes });
    showToast(`Welcome, ${this._name}! Let's start hacking! 🔥`);
    CFC_ROUTER.navigate('dashboard');
  },
};

window.OnboardingPage = OnboardingPage;
