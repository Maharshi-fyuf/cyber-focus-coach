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

export type SessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';

export interface StudySession {
  id: string;
  user_id: string;
  topic_id?: number | null;
  start_time: string;
  end_time?: string | null;
  duration_minutes: number;
  status: SessionStatus;
  notes?: string | null;
  created_at: string;
}

export type FocusEventType =
  | 'TAB_SWITCH'
  | 'BLUR'
  | 'CURSOR_IDLE'
  | 'CAMERA_DISTRACTED'
  | 'PAUSE_TRIGGERED'
  | 'RESUME_TRIGGERED';

export interface FocusEvent {
  id: string;
  session_id: string;
  timestamp: string;
  event_type: FocusEventType;
  score_delta: number;
  metadata_json?: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  total_study_minutes: number;
  focus_score_avg: number;
  completed_topics_count: number;
  reflections_json?: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  topic_id: number;
  title: string;
  description?: string;
  passing_score: number;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  passed: boolean;
  answers_json: string;
  attempted_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_study_date: string;
  last_active_date: string;
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
