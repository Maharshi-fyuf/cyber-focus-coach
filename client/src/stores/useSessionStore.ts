import { create } from 'zustand';
import type { StudySession, SessionStatus } from '@cyber-focus-coach/shared';

interface SessionState {
  currentSession: StudySession | null;
  status: SessionStatus | 'IDLE';
  elapsedSeconds: number;
  loading: boolean;
  error: string | null;
  
  // Actions
  startSession: (topicId?: number) => Promise<void>;
  pauseSession: (reason?: string) => Promise<void>;
  resumeSession: () => Promise<void>;
  endSession: (notes?: string) => Promise<void>;
  syncSession: () => Promise<void>;
  tick: () => void;
  resetError: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: null,
  status: 'IDLE',
  elapsedSeconds: 0,
  loading: false,
  error: null,

  resetError: () => set({ error: null }),

  tick: () => {
    const { currentSession, status } = get();
    if (status === 'running' && currentSession?.start_time) {
      // Calculate delta from start time to prevent drift
      const start = new Date(currentSession.start_time).getTime();
      const now = Date.now();
      set({ elapsedSeconds: Math.floor((now - start) / 1000) });
    }
  },

  syncSession: async () => {
    try {
      const res = await fetch('/api/session/active');
      if (res.status === 404) {
        set({ currentSession: null, status: 'IDLE', elapsedSeconds: 0 });
        return;
      }
      if (!res.ok) throw new Error('Failed to sync session');
      
      const data = await res.json();
      
      if (!data) {
        set({ currentSession: null, status: 'IDLE', elapsedSeconds: 0 });
        return;
      }

      set({ 
        currentSession: data, 
        status: data.session_status || 'IDLE'
      });
      get().tick();
    } catch (err: any) {
      console.error('Sync error:', err);
    }
  },

  startSession: async (topicId?: number, plannedMinutes: number = 60) => {
    set({ loading: true, error: null });
    try {
      const body: any = { planned_minutes: plannedMinutes };
      if (topicId) body.topic_id = topicId;

      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      // Fix: backend returns the session object directly, not wrapped in a "session" key
      set({ 
        currentSession: data, 
        status: 'running',
        elapsedSeconds: 0,
        loading: false 
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  pauseSession: async (reason = 'Manual pause') => {
    const { currentSession } = get();
    if (!currentSession) return;
    
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/session/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      set({ 
        currentSession: data, 
        status: 'paused',
        loading: false 
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  resumeSession: async () => {
    const { currentSession } = get();
    if (!currentSession) return;
    
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/session/resume`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      set({ 
        currentSession: data, 
        status: 'running',
        loading: false 
      });
      get().tick();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  endSession: async (notes) => {
    const { currentSession } = get();
    if (!currentSession) return;
    
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/session/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notes ? { notes } : {})
      });
      if (!res.ok) throw new Error(await res.text());
      
      set({ 
        currentSession: null, 
        status: 'IDLE',
        elapsedSeconds: 0,
        loading: false 
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  }
}));
