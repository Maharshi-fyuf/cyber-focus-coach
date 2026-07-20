/**
 * settings.js — Settings and privacy configuration page
 */

const SettingsPage = {
  async render(container) {
    await CFC_API.loadSettings();
    await CFC_API.loadUser();
    const { settings, userName, dailyTargetMinutes } = CFC_STATE.getState();

    container.innerHTML = `
      ${CFC_UI.renderSidebar('settings')}
      <main class="main-content">
        <div class="page-header">
          <div class="page-title"><span>⚙</span> Settings</div>
          <div class="page-subtitle">Customize your focus coach experience</div>
        </div>

        <div style="max-width:600px">
          <!-- Profile -->
          <div class="card mb-6">
            <div class="card-title">👤 Profile</div>
            <div class="form-group">
              <label class="form-label">Display Name</label>
              <input class="form-input" id="set-name" type="text" value="${userName}" maxlength="30" />
            </div>
            <div class="form-group">
              <label class="form-label">Daily Focus Target</label>
              <select class="form-select" id="set-target">
                <option value="25" ${dailyTargetMinutes==25?'selected':''}>25 minutes</option>
                <option value="30" ${dailyTargetMinutes==30?'selected':''}>30 minutes</option>
                <option value="45" ${dailyTargetMinutes==45?'selected':''}>45 minutes</option>
                <option value="60" ${dailyTargetMinutes==60?'selected':''}>60 minutes (Recommended)</option>
                <option value="90" ${dailyTargetMinutes==90?'selected':''}>90 minutes</option>
                <option value="120" ${dailyTargetMinutes==120?'selected':''}>120 minutes</option>
              </select>
            </div>
            <button class="btn btn-primary btn-sm" id="save-profile-btn">💾 Save Profile</button>
          </div>

          <!-- Focus Detection -->
          <div class="card mb-6">
            <div class="card-title">📡 Focus Detection</div>
            <div class="toggle-wrapper">
              <div class="toggle-info">
                <div class="toggle-info-title">📷 Webcam Presence Detection</div>
                <div class="toggle-info-desc">Detects if your face is visible. No video stored.</div>
              </div>
              <label class="toggle">
                <input type="checkbox" id="camera-toggle" ${settings.camera_enabled ? 'checked' : ''} />
                <div class="toggle-slider"></div>
              </label>
            </div>
            <div class="toggle-wrapper">
              <div class="toggle-info">
                <div class="toggle-info-title">👁 Tab Visibility Check</div>
                <div class="toggle-info-desc">Pauses timer when you switch tabs. Always on.</div>
              </div>
              <label class="toggle">
                <input type="checkbox" checked disabled />
                <div class="toggle-slider"></div>
              </label>
            </div>
            <div class="toggle-wrapper">
              <div class="toggle-info">
                <div class="toggle-info-title">🖱 Cursor Idle Detection</div>
                <div class="toggle-info-desc">Pauses when no mouse movement detected. Always on.</div>
              </div>
              <label class="toggle">
                <input type="checkbox" checked disabled />
                <div class="toggle-slider"></div>
              </label>
            </div>

            <div class="separator"></div>

            <div class="form-group mt-4">
              <label class="form-label">Focus Confidence Threshold (%)</label>
              <div class="flex items-center gap-3">
                <input type="range" id="threshold-slider" min="20" max="80" step="5" value="${settings.focus_threshold}"
                  style="flex:1;accent-color:var(--primary)" />
                <span class="mono text-green" id="threshold-val">${settings.focus_threshold}%</span>
              </div>
              <div class="text-xs text-muted mt-2">Lower = more lenient. Higher = stricter. Recommended: 50%</div>
            </div>

            <div class="form-group">
              <label class="form-label">Idle Threshold (seconds)</label>
              <select class="form-select" id="idle-threshold">
                <option value="15" ${settings.idle_threshold_seconds==15?'selected':''}>15 seconds (strict)</option>
                <option value="30" ${settings.idle_threshold_seconds==30?'selected':''}>30 seconds (recommended)</option>
                <option value="60" ${settings.idle_threshold_seconds==60?'selected':''}>60 seconds (lenient)</option>
                <option value="120" ${settings.idle_threshold_seconds==120?'selected':''}>2 minutes (very lenient)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Grace Period (seconds before pause)</label>
              <select class="form-select" id="grace-period">
                <option value="5" ${settings.grace_period_seconds==5?'selected':''}>5 seconds</option>
                <option value="10" ${settings.grace_period_seconds==10?'selected':''}>10 seconds (recommended)</option>
                <option value="15" ${settings.grace_period_seconds==15?'selected':''}>15 seconds</option>
                <option value="30" ${settings.grace_period_seconds==30?'selected':''}>30 seconds</option>
              </select>
            </div>

            <button class="btn btn-primary btn-sm" id="save-focus-btn">💾 Save Focus Settings</button>
          </div>

          <!-- Privacy -->
          <div class="card mb-6">
            <div class="card-title">🔒 Privacy</div>
            <div class="privacy-notice">
              <div class="privacy-notice-title">What we store</div>
              <p>All data is stored locally in your browser's IndexedDB. Nothing is sent to any server. No analytics, no tracking, no cloud.</p>
            </div>
            <div class="toggle-wrapper mt-4">
              <div class="toggle-info">
                <div class="toggle-info-title">🔒 Privacy Mode</div>
                <div class="toggle-info-desc">Hides sensitive log content in the UI (content still saved).</div>
              </div>
              <label class="toggle">
                <input type="checkbox" id="privacy-mode" ${settings.privacy_mode ? 'checked' : ''} />
                <div class="toggle-slider"></div>
              </label>
            </div>
          </div>

          <!-- Data Management -->
          <div class="card mb-6">
            <div class="card-title">💾 Data Management</div>
            <div class="flex gap-3 flex-wrap">
              <button class="btn btn-ghost btn-sm" id="export-btn">⬇ Export All Data</button>
              <button class="btn btn-danger btn-sm" id="reset-btn">🗑 Reset All Data</button>
            </div>
            <div class="text-xs text-muted mt-4 font-mono">
              Export saves all sessions, logs, streaks, and settings as a JSON file.<br>
              Reset clears all data and restarts the app. This cannot be undone.
            </div>
          </div>

          <!-- Version -->
          <div class="card">
            <div class="card-title">ℹ About</div>
            <div class="font-mono text-xs text-muted" style="line-height:2">
              <div>Cyber Focus Coach v1.0.0</div>
              <div>Local-first · No cloud · Open source</div>
              <div>Built for cybersecurity learners</div>
              <div>Focus signals: Tab Visibility + Cursor Idle + Camera (optional)</div>
            </div>
          </div>
        </div>
      </main>
    `;

    this._attachListeners(container);
  },

  _attachListeners(container) {
    const qs = id => container.querySelector(id);

    // Threshold slider live update
    qs('#threshold-slider')?.addEventListener('input', (e) => {
      const val = qs('#threshold-val');
      if (val) val.textContent = e.target.value + '%';
    });

    // Save profile
    qs('#save-profile-btn')?.addEventListener('click', async () => {
      const name   = qs('#set-name')?.value?.trim() || 'Hacker';
      const target = parseInt(qs('#set-target')?.value || 60);
      await CFC_API.updateUserProfile(name, target);
      showToast('✅ Profile saved!');
    });

    // Save focus settings
    qs('#save-focus-btn')?.addEventListener('click', async () => {
      const cameraEnabled = qs('#camera-toggle')?.checked;
      const threshold     = parseInt(qs('#threshold-slider')?.value || 50);
      const idleThreshold = parseInt(qs('#idle-threshold')?.value || 30);
      const gracePeriod   = parseInt(qs('#grace-period')?.value || 10);
      const privacyMode   = qs('#privacy-mode')?.checked;

      // If enabling camera, request permission
      if (cameraEnabled && !CFC_STATE.getState().settings.camera_enabled) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(t => t.stop());
        } catch {
          showToast('Camera permission denied.', 'warning');
          qs('#camera-toggle').checked = false;
          return;
        }
      }

      await CFC_API.saveSettings({
        camera_enabled: cameraEnabled,
        focus_threshold: threshold,
        idle_threshold_seconds: idleThreshold,
        grace_period_seconds: gracePeriod,
        privacy_mode: privacyMode,
      });
      showToast('✅ Focus settings saved!');
    });

    // Export
    qs('#export-btn')?.addEventListener('click', async () => {
      await CFC_API.exportData();
      showToast('✅ Data exported successfully!');
    });

    // Reset
    qs('#reset-btn')?.addEventListener('click', () => {
      if (confirm('⚠ Are you sure you want to reset ALL data? This cannot be undone.')) {
        CFC_API.clearAllData();
      }
    });
  },
};

window.SettingsPage = SettingsPage;
