/**
 * logs.js — Daily logs and session history page
 */

const LogsPage = {
  async render(container) {
    await Promise.all([CFC_API.loadLogs(), CFC_API.loadRoadmap()]);
    const { logs, topics } = CFC_STATE.getState();

    container.innerHTML = `
      ${CFC_UI.renderSidebar('logs')}
      <main class="main-content">
        <div class="page-header">
          <div class="page-title"><span>📋</span> Study Logs</div>
          <div class="page-subtitle">Your daily learning journal — ${logs.length} entries</div>
        </div>

        <!-- Quick Log Form -->
        <div class="card mb-6" id="quick-log-card">
          <div class="card-title">✍ Add Today's Log</div>
          <div class="grid-2" style="gap:12px;margin-bottom:12px">
            <div class="form-group" style="margin:0">
              <label class="form-label">Topic</label>
              <select class="form-select" id="log-topic">
                ${topics.map(t => `<option value="${t.id}">${t.sequence_order}. ${t.title}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin:0">
              <label class="form-label">Date</label>
              <input class="form-input" id="log-date" type="date" value="${new Date().toISOString().split('T')[0]}" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Summary</label>
            <textarea class="form-textarea" id="log-summary" placeholder="What did you study today?…" style="min-height:70px"></textarea>
          </div>
          <div class="grid-2" style="gap:12px">
            <div class="form-group" style="margin:0">
              <label class="form-label">Win 🏆</label>
              <input class="form-input" id="log-wins" type="text" placeholder="Something I nailed…" />
            </div>
            <div class="form-group" style="margin:0">
              <label class="form-label">Blocker ⚠</label>
              <input class="form-input" id="log-blockers" type="text" placeholder="Where I got stuck…" />
            </div>
          </div>
          <div class="form-group mt-4">
            <label class="form-label">Next Step →</label>
            <input class="form-input" id="log-next" type="text" placeholder="Tomorrow I'll…" />
          </div>
          <button class="btn btn-primary mt-4" id="save-log-btn">💾 Save Log Entry</button>
        </div>

        <!-- Log History -->
        <div>
          <div class="label mb-4">History</div>
          ${logs.length === 0
            ? `<div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-title">No logs yet</div>
                <div class="empty-state-desc">Complete your first session to create your first log entry.</div>
               </div>`
            : logs.map(log => CFC_UI.renderLogEntry(log, topics)).join('')
          }
        </div>
      </main>
    `;

    this._attachListeners(container);
  },

  _attachListeners(container) {
    container.querySelector('#save-log-btn')?.addEventListener('click', async () => {
      const topicId  = parseInt(container.querySelector('#log-topic')?.value || 1);
      const date     = container.querySelector('#log-date')?.value || new Date().toISOString().split('T')[0];
      const summary  = container.querySelector('#log-summary')?.value || '';
      const wins     = container.querySelector('#log-wins')?.value || '';
      const blockers = container.querySelector('#log-blockers')?.value || '';
      const nextStep = container.querySelector('#log-next')?.value || '';

      if (!summary.trim()) { showToast('Please add a summary before saving.', 'warning'); return; }

      await CFC_API.saveLog(date, topicId, summary, wins, blockers, nextStep);
      showToast('✅ Log entry saved!');
      await LogsPage.render(container);
    });
  },
};

window.LogsPage = LogsPage;
