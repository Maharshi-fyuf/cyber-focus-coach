/**
 * dashboard.js — Main dashboard page
 */

const DashboardPage = {
  async render(container) {
    await Promise.all([
      CFC_API.loadDashboard(),
      CFC_API.loadStreaks(),
      CFC_API.loadRoadmap(),
    ]);

    const { todayStats, streaks, topics, userName, dailyTargetMinutes, totalFocusedMinutes } = CFC_STATE.getState();
    const activeTopic = topics.find(t => !t.is_locked && !t.is_completed) || topics[0];
    const progressPct = dailyTargetMinutes > 0 ? Math.min(100, Math.round((todayStats.focusedMinutes / dailyTargetMinutes) * 100)) : 0;
    const totalHours  = Math.round((totalFocusedMinutes || 0) / 60 * 10) / 10;

    const targetMet = todayStats.focusedMinutes >= dailyTargetMinutes;

    container.innerHTML = `
      ${CFC_UI.renderSidebar('dashboard')}
      <main class="main-content">
        <div class="page-header">
          <div class="page-title">
            <span>⬡</span>
            Dashboard
            <span class="badge badge-green" style="font-size:0.7rem">ONLINE</span>
          </div>
          <div class="page-subtitle">
            Good ${_getGreeting()}, <strong style="color:var(--primary)">${userName}</strong>. 
            ${targetMet
              ? '🎉 Daily target achieved! Amazing work.'
              : `${dailyTargetMinutes - todayStats.focusedMinutes}m left to hit your daily goal.`}
          </div>
        </div>

        <!-- Stat Row -->
        <div class="grid-4 mb-8">
          ${CFC_UI.renderStatBox('⏱', todayStats.focusedMinutes + 'm', 'Focused Today', `Target: ${dailyTargetMinutes}m`)}
          ${CFC_UI.renderStatBox('🔥', streaks.current_streak_days, 'Day Streak', `Best: ${streaks.best_streak_days} days`, 'amber')}
          ${CFC_UI.renderStatBox('⚡', totalHours + 'h', 'Total Hours', `${todayStats.sessionCount} session${todayStats.sessionCount !== 1 ? 's' : ''} today`, 'blue')}
          ${CFC_UI.renderStatBox('📚', topics.filter(t => t.is_completed).length + '/' + topics.length, 'Topics Done', `${Math.round(topics.filter(t=>t.is_completed).length/topics.length*100)}% complete`, 'purple')}
        </div>

        <!-- Daily Progress -->
        <div class="card mb-6">
          <div class="card-title">📡 Today's Mission</div>
          <div class="flex items-center justify-between mb-4">
            <span class="label">Daily Focus Progress</span>
            <span class="mono text-green" style="font-size:0.8rem">${progressPct}%</span>
          </div>
          <div class="progress-bar" style="height:8px">
            <div class="progress-fill" style="width:${progressPct}%"></div>
          </div>
          <div class="flex items-center justify-between mt-4">
            <span class="text-xs text-muted font-mono">${todayStats.focusedMinutes}m focused</span>
            <span class="text-xs text-muted font-mono">${dailyTargetMinutes}m target</span>
          </div>
        </div>

        <div class="grid-2 mb-6">
          <!-- Active Topic -->
          <div class="card">
            <div class="card-title">🎯 Active Topic</div>
            ${activeTopic ? `
              <div style="margin-bottom:12px">
                <div class="badge badge-blue mb-2">${activeTopic.category}</div>
                <div style="font-family:var(--font-mono);font-size:1rem;font-weight:600;color:var(--text-primary);margin:8px 0">${activeTopic.title}</div>
                <div class="text-xs text-muted">${activeTopic.description}</div>
                <div class="text-xs text-muted mt-4">Est. ${activeTopic.estimated_days} day${activeTopic.estimated_days !== 1 ? 's' : ''}</div>
              </div>
              <div class="flex gap-3">
                <button class="btn btn-primary btn-sm" id="quick-start-btn" data-topic="${activeTopic.id}">▶ Start Session</button>
                <button class="btn btn-ghost btn-sm" id="view-roadmap-btn">View Roadmap →</button>
              </div>
            ` : `<div class="text-muted text-sm">All topics completed! 🎉</div>`}
          </div>

          <!-- Streak Card -->
          ${CFC_UI.renderStreakCard(streaks)}
        </div>

        <!-- Recent Topics Roadmap Preview -->
        <div class="card mb-6">
          <div class="card-title">🗺 Roadmap Preview</div>
          ${CFC_UI.renderRoadmapTrack(topics.slice(0, 5))}
          <div class="mt-4">
            <button class="btn btn-ghost btn-sm" id="full-roadmap-btn">View Full Roadmap →</button>
          </div>
        </div>

        ${todayStats.sessionCount === 0 ? `
          <div class="card" style="border-color:rgba(0,255,136,0.25);background:rgba(0,255,136,0.03)">
            <div class="flex items-center gap-4">
              <div style="font-size:2.5rem">🏁</div>
              <div>
                <div style="font-family:var(--font-mono);font-size:1rem;color:var(--primary);font-weight:600">Ready to start?</div>
                <div class="text-sm text-muted">No sessions yet today. Your streak depends on it!</div>
              </div>
              <button class="btn btn-primary" id="hero-start-btn" style="margin-left:auto" ${activeTopic ? `data-topic="${activeTopic.id}"` : ''}>
                ⚡ Start Focus Session
              </button>
            </div>
          </div>
        ` : ''}
      </main>
    `;

    this._attachListeners(container);
  },

  _attachListeners(container) {
    const qs = (id) => container.querySelector(id);
    [qs('#quick-start-btn'), qs('#hero-start-btn')].forEach(btn => {
      if (btn) btn.addEventListener('click', () => {
        const topicId = parseInt(btn.dataset.topic || 1);
        CFC_ROUTER.navigate('session', { topicId });
      });
    });
    qs('#view-roadmap-btn')?.addEventListener('click', () => CFC_ROUTER.navigate('roadmap'));
    qs('#full-roadmap-btn')?.addEventListener('click', () => CFC_ROUTER.navigate('roadmap'));

    // Roadmap node clicks
    container.querySelectorAll('[data-topic]').forEach(node => {
      node.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.topic);
        if (id) CFC_ROUTER.navigate('roadmap');
      });
    });
  },
};

function _getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'late night';
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}

window.DashboardPage = DashboardPage;
