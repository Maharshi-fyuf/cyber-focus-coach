import type { Request, Response } from 'express';
import db from '../db/database.js';
import crypto from 'crypto';

// In a real multi-tenant app, this would come from an auth middleware.
// For our local app, we use the default user we seeded.
const DEFAULT_USER_ID = 'default-user-id-001';

export const startSession = async (req: Request, res: Response) => {
    try {
        const { topic_id, planned_minutes } = req.body;

        if (!topic_id || !planned_minutes) {
            return res.status(400).json({ error: 'topic_id and planned_minutes are required' });
        }

        // Check if there is already an active session
        const existingSession = await db.execute({
            sql: `SELECT * FROM study_sessions WHERE user_id = ? AND session_status IN ('running', 'paused') LIMIT 1`,
            args: [DEFAULT_USER_ID]
        });

        if (existingSession.rows.length > 0) {
            return res.status(400).json({ error: 'An active session already exists', session: existingSession.rows[0] });
        }

        const sessionId = crypto.randomUUID();
        const startTime = new Date().toISOString();

        await db.execute({
            sql: `
                INSERT INTO study_sessions 
                (id, user_id, topic_id, planned_minutes, session_status, start_time, created_at)
                VALUES (?, ?, ?, ?, 'running', ?, ?)
            `,
            args: [sessionId, DEFAULT_USER_ID, topic_id, planned_minutes, startTime, startTime]
        });

        // Log the start event
        await db.execute({
            sql: `
                INSERT INTO focus_events (id, session_id, event_type, timestamp)
                VALUES (?, ?, 'session_start', ?)
            `,
            args: [crypto.randomUUID(), sessionId, startTime]
        });

        const newSession = await db.execute({
            sql: `SELECT * FROM study_sessions WHERE id = ?`,
            args: [sessionId]
        });

        res.status(201).json(newSession.rows[0]);
    } catch (error) {
        console.error('startSession error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const pauseSession = async (req: Request, res: Response) => {
    try {
        const { reason } = req.body;

        const activeSession = await db.execute({
            sql: `SELECT * FROM study_sessions WHERE user_id = ? AND session_status = 'running' LIMIT 1`,
            args: [DEFAULT_USER_ID]
        });

        if (activeSession.rows.length === 0) {
            return res.status(404).json({ error: 'No running session found' });
        }

        const sessionId = activeSession.rows[0].id as string;
        const pauseTime = new Date().toISOString();

        await db.execute({
            sql: `
                UPDATE study_sessions 
                SET session_status = 'paused', pause_reason_last = ?
                WHERE id = ?
            `,
            args: [reason || 'manual', sessionId]
        });

        await db.execute({
            sql: `
                INSERT INTO focus_events (id, session_id, event_type, event_value, timestamp)
                VALUES (?, ?, 'paused', ?, ?)
            `,
            args: [crypto.randomUUID(), sessionId, reason || 'manual', pauseTime]
        });

        const updatedSession = await db.execute({
            sql: `SELECT * FROM study_sessions WHERE id = ?`,
            args: [sessionId]
        });

        res.json(updatedSession.rows[0]);
    } catch (error) {
        console.error('pauseSession error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const resumeSession = async (req: Request, res: Response) => {
    try {
        const activeSession = await db.execute({
            sql: `SELECT * FROM study_sessions WHERE user_id = ? AND session_status = 'paused' LIMIT 1`,
            args: [DEFAULT_USER_ID]
        });

        if (activeSession.rows.length === 0) {
            return res.status(404).json({ error: 'No paused session found' });
        }

        const sessionId = activeSession.rows[0].id as string;
        const resumeTime = new Date().toISOString();

        // In a real scenario, we'd calculate exactly how many minutes it was paused for based on the last event.
        // For now, we just update status to running.
        await db.execute({
            sql: `
                UPDATE study_sessions 
                SET session_status = 'running'
                WHERE id = ?
            `,
            args: [sessionId]
        });

        await db.execute({
            sql: `
                INSERT INTO focus_events (id, session_id, event_type, timestamp)
                VALUES (?, ?, 'resumed', ?)
            `,
            args: [crypto.randomUUID(), sessionId, resumeTime]
        });

        const updatedSession = await db.execute({
            sql: `SELECT * FROM study_sessions WHERE id = ?`,
            args: [sessionId]
        });

        res.json(updatedSession.rows[0]);
    } catch (error) {
        console.error('resumeSession error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const endSession = async (req: Request, res: Response) => {
    try {
        const { notes, reflection, wins, blockers, next_step } = req.body;

        const activeSession = await db.execute({
            sql: `SELECT * FROM study_sessions WHERE user_id = ? AND session_status IN ('running', 'paused') LIMIT 1`,
            args: [DEFAULT_USER_ID]
        });

        if (activeSession.rows.length === 0) {
            return res.status(404).json({ error: 'No active session found to end' });
        }

        const session = activeSession.rows[0];
        const sessionId = session.id as string;
        const topicId = session.topic_id as number;
        const endTime = new Date().toISOString();

        // 1. Update Session
        await db.execute({
            sql: `
                UPDATE study_sessions 
                SET session_status = 'completed', end_time = ?
                WHERE id = ?
            `,
            args: [endTime, sessionId]
        });

        // 2. Log End Event
        await db.execute({
            sql: `
                INSERT INTO focus_events (id, session_id, event_type, timestamp)
                VALUES (?, ?, 'session_end', ?)
            `,
            args: [crypto.randomUUID(), sessionId, endTime]
        });

        // 3. Save Artifacts if any
        if (notes) {
            await db.execute({
                sql: `INSERT INTO session_artifacts (id, session_id, artifact_type, content, created_at) VALUES (?, ?, ?, ?, ?)`,
                args: [crypto.randomUUID(), sessionId, 'note', notes, endTime]
            });
        }
        if (reflection) {
            await db.execute({
                sql: `INSERT INTO session_artifacts (id, session_id, artifact_type, content, created_at) VALUES (?, ?, ?, ?, ?)`,
                args: [crypto.randomUUID(), sessionId, 'reflection', reflection, endTime]
            });
        }

        // 4. Save to Daily Log
        const logDate = endTime.split('T')[0];
        await db.execute({
            sql: `
                INSERT INTO daily_logs (id, user_id, log_date, topic_id, summary, wins, blockers, next_step, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_id, log_date) DO UPDATE SET
                    summary = excluded.summary,
                    wins = excluded.wins,
                    blockers = excluded.blockers,
                    next_step = excluded.next_step
            `,
            args: [crypto.randomUUID(), DEFAULT_USER_ID, logDate, topicId, notes || '', wins || '', blockers || '', next_step || '', endTime]
        });

        // 5. Update Streak (Simplified: just check last active date, if yesterday, increment. If today, do nothing. Else reset to 1)
        const streakResult = await db.execute({
            sql: `SELECT * FROM streaks WHERE user_id = ?`,
            args: [DEFAULT_USER_ID]
        });
        
        let currentStreak = 1;
        let bestStreak = 1;

        if (streakResult.rows.length > 0) {
            const streak = streakResult.rows[0];
            const lastActive = streak.last_active_date as string;
            bestStreak = streak.best_streak_days as number;
            
            if (lastActive) {
                const today = new Date(logDate);
                const lastDate = new Date(lastActive);
                const diffTime = Math.abs(today.getTime() - lastDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                if (diffDays === 1) {
                    currentStreak = (streak.current_streak_days as number) + 1;
                    if (currentStreak > bestStreak) bestStreak = currentStreak;
                } else if (diffDays === 0) {
                    currentStreak = streak.current_streak_days as number; // Already studied today
                }
            }
            
            await db.execute({
                sql: `UPDATE streaks SET current_streak_days = ?, best_streak_days = ?, last_active_date = ?, updated_at = ? WHERE user_id = ?`,
                args: [currentStreak, bestStreak, logDate, endTime, DEFAULT_USER_ID]
            });
        }

        const finalSession = await db.execute({
            sql: `SELECT * FROM study_sessions WHERE id = ?`,
            args: [sessionId]
        });

        res.json({
            session: finalSession.rows[0],
            streak: { current: currentStreak, best: bestStreak }
        });
    } catch (error) {
        console.error('endSession error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getActiveSession = async (req: Request, res: Response) => {
    try {
        const activeSession = await db.execute({
            sql: `SELECT * FROM study_sessions WHERE user_id = ? AND session_status IN ('running', 'paused') LIMIT 1`,
            args: [DEFAULT_USER_ID]
        });

        if (activeSession.rows.length === 0) {
            return res.json(null);
        }

        res.json(activeSession.rows[0]);
    } catch (error) {
        console.error('getActiveSession error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
