/**
 * api.js — Business logic layer (replaces Express backend)
 * All data operations go through IndexedDB via CFC_DB
 */

const CFC_API = (() => {

  /* ---- Helpers ---- */
  function todayISO() { return new Date().toISOString().split('T')[0]; }
  function nowISO()   { return new Date().toISOString(); }

  async function getCurrentUser() {
    const users = await CFC_DB.getAll('users');
    return users[0] || null;
  }

  async function getSettings() {
    const all = await CFC_DB.getAll('settings');
    return all[0] || null;
  }

  /* ====================================================
     SESSION
     ==================================================== */

  async function startSession(topicId, plannedMinutes) {
    const user = await getCurrentUser();
    if (!user) throw new Error('No user found');

    const topic = await CFC_DB.get('roadmap_topics', topicId);
    const sessionId = CFC_DB.uid();
    const session = {
      id:             sessionId,
      user_id:        user.id,
      topic_id:       topicId,
      planned_minutes:plannedMinutes,
      focused_minutes:0,
      paused_minutes: 0,
      session_status: 'running',
      start_time:     nowISO(),
      end_time:       null,
      focus_score_avg:100,
      pause_reason_last: null,
      created_at:     nowISO(),
    };
    await CFC_DB.put('study_sessions', session);

    CFC_STATE.setState({
      currentSession: { id: sessionId, topicId, topicTitle: topic?.title || 'Unknown Topic', plannedMinutes, startTime: session.start_time },
      sessionStatus:  'running',
      sessionElapsed: 0,
      sessionPaused:  0,
      pauseReason:    null,
      showPauseModal: false,
    });

    // Log focus event
    await _logFocusEvent(sessionId, 'session_start', 'Session started', 100);
    return session;
  }

  async function pauseSession(reason) {
    const { currentSession } = CFC_STATE.getState();
    if (!currentSession) return;
    const session = await CFC_DB.get('study_sessions', currentSession.id);
    if (!session) return;
    session.session_status = 'paused';
    session.pause_reason_last = reason;
    await CFC_DB.put('study_sessions', session);
    await _logFocusEvent(currentSession.id, 'paused', reason, CFC_STATE.getField('focusConfidence'));
  }

  async function resumeSession() {
    const { currentSession } = CFC_STATE.getState();
    if (!currentSession) return;
    const session = await CFC_DB.get('study_sessions', currentSession.id);
    if (!session) return;
    session.session_status = 'running';
    await CFC_DB.put('study_sessions', session);
    await _logFocusEvent(currentSession.id, 'resumed', 'User returned to focus', CFC_STATE.getField('focusConfidence'));
    CFC_STATE.setState({ sessionStatus: 'running', showPauseModal: false, pauseReason: null });
  }

  async function endSession(notes, reflection, wins, blockers, nextStep) {
    const { currentSession, sessionElapsed, sessionPaused, focusConfidence } = CFC_STATE.getState();
    if (!currentSession) return;

    const session = await CFC_DB.get('study_sessions', currentSession.id);
    if (!session) return;

    const focusedMinutes = Math.round(sessionElapsed / 60);
    const pausedMinutes  = Math.round(sessionPaused  / 60);

    session.session_status  = 'completed';
    session.end_time        = nowISO();
    session.focused_minutes = focusedMinutes;
    session.paused_minutes  = pausedMinutes;
    session.focus_score_avg = focusConfidence;
    await CFC_DB.put('study_sessions', session);

    // Save artifact (notes)
    if (notes || reflection) {
      await CFC_DB.put('session_artifacts', {
        id: CFC_DB.uid(),
        session_id:   currentSession.id,
        artifact_type:'note',
        content:      JSON.stringify({ notes, reflection }),
        created_at:   nowISO(),
      });
    }

    // Save daily log
    const user  = await getCurrentUser();
    const today = todayISO();
    const existingLogs = await CFC_DB.getByIndex('daily_logs', 'by_date', today);
    if (existingLogs.length === 0) {
      await CFC_DB.put('daily_logs', {
        id:       CFC_DB.uid(),
        user_id:  user.id,
        log_date: today,
        topic_id: currentSession.topicId,
        summary:  notes || '',
        wins:     wins || '',
        blockers: blockers || '',
        next_step:nextStep || '',
        created_at: nowISO(),
      });
    } else {
      const log = existingLogs[0];
      log.summary   += (log.summary ? '\n' : '') + (notes || '');
      log.wins      += (log.wins ? '\n' : '') + (wins || '');
      log.blockers  += (log.blockers ? '\n' : '') + (blockers || '');
      log.next_step  = nextStep || log.next_step;
      await CFC_DB.put('daily_logs', log);
    }

    // Update streak
    await _updateStreak(user.id, today, focusedMinutes);

    // Stop focus engine
    CFC_FOCUS.stop();

    CFC_STATE.setState({
      sessionStatus:  'idle',
      currentSession: null,
      sessionElapsed: 0,
      sessionPaused:  0,
    });

    await _logFocusEvent(currentSession.id, 'session_end', `Session ended. Focused: ${focusedMinutes}m`, focusConfidence);
    return { focusedMinutes, pausedMinutes };
  }

  async function _logFocusEvent(sessionId, eventType, eventValue, confidence) {
    await CFC_DB.put('focus_events', {
      id:         CFC_DB.uid(),
      session_id: sessionId,
      event_type: eventType,
      event_value:eventValue,
      confidence: confidence,
      timestamp:  nowISO(),
    });
  }

  /* ====================================================
     STREAK
     ==================================================== */

  async function _updateStreak(userId, today, focusedMinutes) {
    const settings = await getSettings();
    const targetMinutes = (await getCurrentUser()).daily_target_minutes || 60;
    const streaks = await CFC_DB.getAll('streaks');
    const streak  = streaks.find(s => s.user_id === userId) || { id: CFC_DB.uid(), user_id: userId, current_streak_days: 0, best_streak_days: 0, last_active_date: null };

    if (focusedMinutes >= targetMinutes) {
      const last = streak.last_active_date;
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yISO = yesterday.toISOString().split('T')[0];

      if (last === today) {
        // Already counted today, no change
      } else if (last === yISO) {
        streak.current_streak_days++;
      } else {
        streak.current_streak_days = 1;
      }
      streak.last_active_date = today;
      streak.best_streak_days = Math.max(streak.best_streak_days, streak.current_streak_days);
      streak.updated_at = nowISO();
      await CFC_DB.put('streaks', streak);
      CFC_STATE.setState({ streaks: { current_streak_days: streak.current_streak_days, best_streak_days: streak.best_streak_days, last_active_date: streak.last_active_date } });
    }
  }

  async function loadStreaks() {
    const user  = await getCurrentUser();
    if (!user) return;
    const all = await CFC_DB.getAll('streaks');
    const streak = all.find(s => s.user_id === user.id) || { current_streak_days: 0, best_streak_days: 0, last_active_date: null };
    CFC_STATE.setState({ streaks: streak });
    return streak;
  }

  /* ====================================================
     DASHBOARD
     ==================================================== */

  async function loadDashboard() {
    const user = await getCurrentUser();
    if (!user) return;

    const today = todayISO();
    const sessions = await CFC_DB.getAll('study_sessions');
    const todaySessions = sessions.filter(s =>
      s.user_id === user.id &&
      s.start_time && s.start_time.startsWith(today) &&
      s.session_status === 'completed'
    );
    const focusedMinutes = todaySessions.reduce((acc, s) => acc + (s.focused_minutes || 0), 0);
    const logs = await CFC_DB.getByIndex('daily_logs', 'by_date', today);
    const topics = await CFC_DB.getAll('roadmap_topics');
    const completedTopics = topics.filter(t => t.is_completed).length;

    const todayStats = {
      focusedMinutes,
      sessionCount: todaySessions.length,
      logCount: logs.length,
      topicsCompleted: completedTopics,
    };

    // Total hours
    const totalFocusedMinutes = sessions
      .filter(s => s.user_id === user.id && s.session_status === 'completed')
      .reduce((acc, s) => acc + (s.focused_minutes || 0), 0);

    CFC_STATE.setState({ todayStats, totalFocusedMinutes, dailyTargetMinutes: user.daily_target_minutes });
    return { todayStats, totalFocusedMinutes };
  }

  /* ====================================================
     ROADMAP
     ==================================================== */

  async function loadRoadmap() {
    const topics = await CFC_DB.getAll('roadmap_topics');
    topics.sort((a, b) => a.sequence_order - b.sequence_order);
    CFC_STATE.setState({ topics });
    return topics;
  }

  async function completeTopic(topicId) {
    const topic = await CFC_DB.get('roadmap_topics', topicId);
    if (!topic) return;
    topic.is_completed = true;
    await CFC_DB.put('roadmap_topics', topic);

    // Unlock next topic
    const nextId = topicId + 1;
    const next = await CFC_DB.get('roadmap_topics', nextId);
    if (next) {
      next.is_locked = false;
      await CFC_DB.put('roadmap_topics', next);
    }
    await loadRoadmap();
    showToast('✅ Topic marked complete! Next topic unlocked.');
  }

  async function unlockTopic(topicId) {
    const topic = await CFC_DB.get('roadmap_topics', topicId);
    if (!topic) return;
    topic.is_locked = false;
    await CFC_DB.put('roadmap_topics', topic);
    await loadRoadmap();
  }

  /* ====================================================
     LOGS
     ==================================================== */

  async function loadLogs() {
    const user = await getCurrentUser();
    if (!user) return [];
    const logs = await CFC_DB.getByIndex('daily_logs', 'by_user', user.id);
    logs.sort((a, b) => b.log_date.localeCompare(a.log_date));
    CFC_STATE.setState({ logs });
    return logs;
  }

  async function saveLog(date, topicId, summary, wins, blockers, nextStep) {
    const user = await getCurrentUser();
    const existing = await CFC_DB.getByIndex('daily_logs', 'by_date', date);
    const existing_user = existing.find(l => l.user_id === user.id);
    const log = existing_user || {
      id: CFC_DB.uid(), user_id: user.id, log_date: date, created_at: nowISO()
    };
    log.topic_id  = topicId;
    log.summary   = summary;
    log.wins      = wins;
    log.blockers  = blockers;
    log.next_step = nextStep;
    await CFC_DB.put('daily_logs', log);
    await loadLogs();
  }

  /* ====================================================
     QUIZZES
     ==================================================== */

  async function loadQuizzes(topicId) {
    const all = await CFC_DB.getAll('quizzes');
    const quizzes = topicId ? all.filter(q => q.topic_id === topicId) : all;
    CFC_STATE.setState({ quizzes });
    return quizzes;
  }

  async function attemptQuiz(quizId, selectedOption) {
    const user = await getCurrentUser();
    const quiz = await CFC_DB.get('quizzes', quizId);
    if (!quiz) return;
    const isCorrect = selectedOption === quiz.correct_option;
    await CFC_DB.put('quiz_attempts', {
      id:              CFC_DB.uid(),
      quiz_id:         quizId,
      user_id:         user.id,
      selected_option: selectedOption,
      is_correct:      isCorrect,
      attempted_at:    nowISO(),
    });
    return { isCorrect, explanation: quiz.explanation, correct_option: quiz.correct_option };
  }

  async function loadQuizAttempts() {
    const user = await getCurrentUser();
    if (!user) return [];
    const attempts = await CFC_DB.getByIndex('quiz_attempts', 'by_user', user.id);
    CFC_STATE.setState({ quizAttempts: attempts });
    return attempts;
  }

  /* ====================================================
     SETTINGS
     ==================================================== */

  async function loadSettings() {
    const s = await getSettings();
    if (s) CFC_STATE.setState({ settings: s });
    return s;
  }

  async function saveSettings(patch) {
    const s = await getSettings();
    if (!s) return;
    Object.assign(s, patch);
    await CFC_DB.put('settings', s);
    CFC_STATE.setState({ settings: s });
    CFC_FOCUS.updateSettings(s);
  }

  async function updateUserProfile(name, dailyTargetMinutes) {
    const user = await getCurrentUser();
    if (!user) return;
    user.name = name;
    user.daily_target_minutes = dailyTargetMinutes;
    user.updated_at = nowISO();
    await CFC_DB.put('users', user);
    CFC_STATE.setState({ userName: name, dailyTargetMinutes });
  }

  async function loadUser() {
    const user = await getCurrentUser();
    if (!user) return null;
    CFC_STATE.setState({ userId: user.id, userName: user.name, dailyTargetMinutes: user.daily_target_minutes });
    return user;
  }

  /* ====================================================
     DATA EXPORT
     ==================================================== */

  async function exportData() {
    const data = {};
    for (const store of ['users','roadmap_topics','study_sessions','focus_events','session_artifacts','daily_logs','streaks','quizzes','quiz_attempts','settings']) {
      data[store] = await CFC_DB.getAll(store);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `cyber-focus-coach-export-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function clearAllData() {
    for (const store of ['users','roadmap_topics','study_sessions','focus_events','session_artifacts','daily_logs','streaks','quizzes','quiz_attempts','settings']) {
      await CFC_DB.clear(store);
    }
    await seedDatabase();
    window.location.reload();
  }

  return {
    startSession, pauseSession, resumeSession, endSession,
    loadDashboard, loadRoadmap, completeTopic, unlockTopic,
    loadLogs, saveLog,
    loadQuizzes, attemptQuiz, loadQuizAttempts,
    loadSettings, saveSettings, updateUserProfile, loadUser,
    loadStreaks, exportData, clearAllData,
  };
})();

window.CFC_API = CFC_API;

/* ---- Global toast helper ---- */
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container') || (() => {
    const c = document.createElement('div');
    c.id = 'toast-container';
    c.className = 'toast-container';
    document.body.appendChild(c);
    return c;
  })();

  const icons = { info: '✓', warning: '⚠', error: '✕' };
  const toast = document.createElement('div');
  toast.className = `toast ${type !== 'info' ? type : ''}`;
  toast.innerHTML = `<span>${icons[type]}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; setTimeout(() => toast.remove(), 400); }, duration);
}

window.showToast = showToast;
