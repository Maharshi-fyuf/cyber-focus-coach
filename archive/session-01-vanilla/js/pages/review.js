/**
 * review.js — Daily review / weekly summary page
 */

const ReviewPage = {
  async render(container) {
    await Promise.all([
      CFC_API.loadDashboard(),
      CFC_API.loadStreaks(),
      CFC_API.loadRoadmap(),
      CFC_API.loadLogs(),
      CFC_API.loadQuizzes(),
      CFC_API.loadQuizAttempts(),
    ]);

    const { todayStats, streaks, topics, logs, quizzes, quizAttempts, dailyTargetMinutes, totalFocusedMinutes } = CFC_STATE.getState();

    // Weekly stats (last 7 days)
    const weeklyData = _getWeeklyData(logs, topics);
    const quizScore  = quizAttempts.length > 0
      ? Math.round(quizAttempts.filter(a => a.is_correct).length / quizAttempts.length * 100)
      : 0;
    const completedCount = topics.filter(t => t.is_completed).length;
    const nextTopic = topics.find(t => !t.is_locked && !t.is_completed);
    const totalHours = Math.round((totalFocusedMinutes || 0) / 60 * 10) / 10;

    container.innerHTML = `
      ${CFC_UI.renderSidebar('review')}
      <main class="main-content">
        <div class="page-header">
          <div class="page-title"><span>📊</span> Review</div>
          <div class="page-subtitle">Your study performance at a glance</div>
        </div>

        <!-- Overall Stats -->
        <div class="grid-4 mb-8">
          ${CFC_UI.renderStatBox('⏱', totalHours + 'h', 'Total Focus Hours', `Today: ${todayStats.focusedMinutes}m`)}
          ${CFC_UI.renderStatBox('🔥', streaks.current_streak_days, 'Current Streak', `Best: ${streaks.best_streak_days} days`, 'amber')}
          ${CFC_UI.renderStatBox('📚', `${completedCount}/${topics.length}`, 'Topics Complete', `${Math.round(completedCount/topics.length*100)}%`, 'blue')}
          ${CFC_UI.renderStatBox('🧠', quizScore + '%', 'Quiz Accuracy', `${quizAttempts.filter(a=>a.is_correct).length}/${quizAttempts.length} correct`, 'purple')}
        </div>

        <!-- Today's Summary -->
        <div class="card mb-6">
          <div class="card-title">📡 Today's Session Summary</div>
          <div class="grid-2">
            <div>
              <div class="label mb-2">Focus Goal</div>
              <div class="progress-bar" style="height:8px;margin-bottom:8px">
                <div class="progress-fill" style="width:${Math.min(100, Math.round(todayStats.focusedMinutes / dailyTargetMinutes * 100))}%"></div>
              </div>
              <div class="flex justify-between text-xs font-mono text-muted">
                <span>${todayStats.focusedMinutes}m focused</span>
                <span>${dailyTargetMinutes}m target</span>
              </div>
            </div>
            <div>
              <div class="label mb-2">Session Result</div>
              <div style="font-family:var(--font-mono);font-size:1.1rem;font-weight:600;color:${todayStats.focusedMinutes >= dailyTargetMinutes ? 'var(--primary)' : 'var(--accent-amber)'}">
                ${todayStats.focusedMinutes >= dailyTargetMinutes ? '✅ Target Met!' : '⚡ Keep going!'}
              </div>
              <div class="text-xs text-muted">${todayStats.sessionCount} session${todayStats.sessionCount !== 1 ? 's' : ''} completed today</div>
            </div>
          </div>
        </div>

        <div class="grid-2 mb-6">
          <!-- Weekly Activity -->
          <div class="card">
            <div class="card-title">📅 Last 7 Days</div>
            <div style="display:flex;gap:6px;align-items:flex-end;height:80px;margin-bottom:8px">
              ${weeklyData.map(day => `
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
                  <div style="
                    flex:1;width:100%;border-radius:3px 3px 0 0;
                    background:${day.minutes >= dailyTargetMinutes ? 'var(--primary)' : day.minutes > 0 ? 'var(--accent-amber)' : 'rgba(255,255,255,0.06)'};
                    height:${day.minutes > 0 ? Math.max(8, Math.min(70, day.minutes / dailyTargetMinutes * 70)) : 4}px;
                    margin-top:auto;
                    box-shadow:${day.minutes >= dailyTargetMinutes ? '0 0 8px rgba(0,255,136,0.4)' : 'none'};
                    transition:height 0.8s ease;
                  "></div>
                  <div class="text-xs font-mono" style="color:var(--text-muted)">${day.label}</div>
                </div>
              `).join('')}
            </div>
            <div class="flex gap-3 text-xs font-mono text-muted">
              <span><span style="color:var(--primary)">■</span> Target met</span>
              <span><span style="color:var(--accent-amber)">■</span> Partial</span>
              <span><span style="color:rgba(255,255,255,0.15)">■</span> None</span>
            </div>
          </div>

          <!-- Streak History -->
          ${CFC_UI.renderStreakCard(streaks)}
        </div>

        <!-- Next Topic Recommendation -->
        ${nextTopic ? `
          <div class="card mb-6" style="border-color:rgba(10,243,255,0.25)">
            <div class="card-title">🚀 Up Next</div>
            <div class="flex items-center gap-4">
              <div>
                <div class="badge badge-blue mb-2">${nextTopic.category}</div>
                <div style="font-family:var(--font-mono);font-size:1rem;font-weight:600;color:var(--text-primary)">${nextTopic.title}</div>
                <div class="text-xs text-muted">${nextTopic.description?.substring(0, 80)}…</div>
              </div>
              <button class="btn btn-primary btn-sm" style="margin-left:auto;white-space:nowrap" onclick="CFC_ROUTER.navigate('session', {topicId:${nextTopic.id}})">
                ▶ Start Now
              </button>
            </div>
          </div>
        ` : `
          <div class="card mb-6" style="border-color:rgba(0,255,136,0.4);background:rgba(0,255,136,0.04)">
            <div class="text-center" style="padding:20px">
              <div style="font-size:3rem">🏆</div>
              <div style="font-family:var(--font-mono);font-size:1.2rem;color:var(--primary);margin:8px 0">Roadmap Complete!</div>
              <div class="text-sm text-muted">You've completed all 30 cybersecurity topics. Time for bug bounty!</div>
            </div>
          </div>
        `}

        <!-- Quiz Performance -->
        ${quizAttempts.length > 0 ? `
          <div class="card">
            <div class="card-title">🧠 Quiz Performance</div>
            <div class="grid-3" style="gap:12px">
              ${CFC_UI.renderStatBox('✅', quizAttempts.filter(a=>a.is_correct).length, 'Correct', '', '')}
              ${CFC_UI.renderStatBox('❌', quizAttempts.filter(a=>!a.is_correct).length, 'Incorrect', '', '')}
              ${CFC_UI.renderStatBox('📊', quizScore + '%', 'Accuracy', quizAttempts.length + ' attempts', quizScore >= 70 ? '' : 'amber')}
            </div>
          </div>
        ` : ''}
      </main>
    `;
  },
};

function _getWeeklyData(logs, topics) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso   = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 2);
    const log   = logs.find(l => l.log_date === iso);
    days.push({ label, minutes: log ? 60 : 0, iso });  // Simplified: if log exists, assume 60m
  }
  return days;
}

window.ReviewPage = ReviewPage;
