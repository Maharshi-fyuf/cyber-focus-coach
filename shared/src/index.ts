/**
 * Shared TypeScript Definitions for Cyber Focus Coach
 */

export interface User {
  id: string;
  name: string;
  timezone: string;
  daily_target_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  user_id: string;
  camera_enabled: boolean;
  screen_capture_enabled: boolean;
  focus_threshold: number;
  idle_threshold_seconds: number;
  grace_period_seconds: number;
  privacy_mode: boolean;
  created_at: string;
}

export interface RoadmapTopic {
  id: number;
  title: string;
  description?: string;
  category?: string;
  sequence_order: number;
  prerequisite_topic_id?: number | null;
  estimated_days: number;
  is_locked: boolean;
  is_completed: boolean;
}

export type SessionStatus = 'running' | 'paused' | 'completed';

export interface StudySession {
  id: string;
  user_id: string;
  topic_id: number | null;
  planned_minutes: number;
  focused_minutes: number;
  paused_minutes: number;
  session_status: SessionStatus;
  start_time: string;
  end_time: string | null;
  focus_score_avg: number | null;
  pause_reason_last: string | null;
  created_at: string;
}

export type FocusEventType =
  | 'TAB_HIDDEN'
  | 'TAB_VISIBLE'
  | 'WINDOW_BLUR'
  | 'WINDOW_FOCUS'
  | 'IDLE_START'
  | 'IDLE_END'
  | 'SESSION_START'
  | 'SESSION_END';

export interface FocusEvent {
  id: string;
  session_id: string;
  event_type: FocusEventType;
  event_value: string | null;
  confidence: number | null;
  timestamp: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  topic_id: number | null;
  summary: string | null;
  wins: string | null;
  blockers: string | null;
  next_step: string | null;
  created_at: string;
}

export interface Quiz {
  id: string;
  topic_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  selected_option: number;
  is_correct: boolean;
  attempted_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak_days: number;
  best_streak_days: number;
  last_active_date: string | null;
  updated_at: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

export interface DashboardResponse {
  date: string;
  focused_minutes: number;
  session_count: number;
  daily_target_minutes: number;
  target_met: boolean;
  topics_completed: number;
  streak: {
    current: number;
    best: number;
  };
  active_topic: RoadmapTopic | null;
}
