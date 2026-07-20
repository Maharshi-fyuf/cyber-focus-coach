-- Cyber Focus Coach: Database Schema

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    timezone TEXT NOT NULL,
    daily_target_minutes INTEGER NOT NULL DEFAULT 60,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    camera_enabled INTEGER NOT NULL DEFAULT 0,
    screen_capture_enabled INTEGER NOT NULL DEFAULT 0,
    focus_threshold INTEGER NOT NULL DEFAULT 50,
    idle_threshold_seconds INTEGER NOT NULL DEFAULT 30,
    grace_period_seconds INTEGER NOT NULL DEFAULT 10,
    privacy_mode INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roadmap_topics (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    sequence_order INTEGER NOT NULL UNIQUE,
    prerequisite_topic_id INTEGER,
    estimated_days INTEGER NOT NULL DEFAULT 2,
    is_locked INTEGER NOT NULL DEFAULT 1,
    is_completed INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(prerequisite_topic_id) REFERENCES roadmap_topics(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS study_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    topic_id INTEGER,
    planned_minutes INTEGER NOT NULL,
    focused_minutes INTEGER NOT NULL DEFAULT 0,
    paused_minutes INTEGER NOT NULL DEFAULT 0,
    session_status TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    focus_score_avg REAL,
    pause_reason_last TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(topic_id) REFERENCES roadmap_topics(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON study_sessions(user_id, start_time);

CREATE TABLE IF NOT EXISTS focus_events (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_value TEXT,
    confidence REAL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY(session_id) REFERENCES study_sessions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_events_session ON focus_events(session_id);

CREATE TABLE IF NOT EXISTS session_artifacts (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    artifact_type TEXT NOT NULL,
    content TEXT,
    content_json TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(session_id) REFERENCES study_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daily_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    log_date TEXT NOT NULL,
    topic_id INTEGER,
    summary TEXT,
    wins TEXT,
    blockers TEXT,
    next_step TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(user_id, log_date),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(topic_id) REFERENCES roadmap_topics(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_logs_user_date ON daily_logs(user_id, log_date);

CREATE TABLE IF NOT EXISTS streaks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    current_streak_days INTEGER NOT NULL DEFAULT 0,
    best_streak_days INTEGER NOT NULL DEFAULT 0,
    last_active_date TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quizzes (
    id TEXT PRIMARY KEY,
    topic_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    FOREIGN KEY(topic_id) REFERENCES roadmap_topics(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_quizzes_topic ON quizzes(topic_id);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id TEXT PRIMARY KEY,
    quiz_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    selected_option INTEGER NOT NULL,
    is_correct INTEGER NOT NULL,
    attempted_at TEXT NOT NULL,
    FOREIGN KEY(quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON quiz_attempts(user_id);
