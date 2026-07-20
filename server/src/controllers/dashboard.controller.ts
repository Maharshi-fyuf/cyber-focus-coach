import type { Request, Response } from 'express';
import db from '../db/database.js';

const DEFAULT_USER_ID = 'default-user-id-001';

export const getTodayDashboard = async (req: Request, res: Response) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];

        // Fetch User and Streak
        const userRes = await db.execute({
            sql: `SELECT * FROM users WHERE id = ?`,
            args: [DEFAULT_USER_ID]
        });
        const streakRes = await db.execute({
            sql: `SELECT * FROM streaks WHERE user_id = ?`,
            args: [DEFAULT_USER_ID]
        });
        const user = userRes.rows[0];
        const streak = streakRes.rows[0] || { current_streak_days: 0, best_streak_days: 0 };

        // Calculate focused minutes for today
        const sessionsRes = await db.execute({
            sql: `SELECT SUM(focused_minutes) as total_focus, COUNT(id) as session_count FROM study_sessions WHERE user_id = ? AND start_time LIKE ? AND session_status = 'completed'`,
            args: [DEFAULT_USER_ID, `${todayStr}%`]
        });
        const focusedMinutes = Number(sessionsRes.rows[0]?.total_focus) || 0;
        const sessionCount = Number(sessionsRes.rows[0]?.session_count) || 0;

        // Topics completed
        const completedTopicsRes = await db.execute(`SELECT COUNT(id) as count FROM roadmap_topics WHERE is_completed = 1`);
        const topicsCompleted = Number(completedTopicsRes.rows[0]?.count) || 0;

        // Active Topic (first unlocked but not completed)
        const activeTopicRes = await db.execute(`SELECT * FROM roadmap_topics WHERE is_locked = 0 AND is_completed = 0 ORDER BY sequence_order ASC LIMIT 1`);
        const activeTopic = activeTopicRes.rows[0] || null;

        const dailyTarget = Number(user?.daily_target_minutes) || 60;

        res.json({
            date: todayStr,
            focused_minutes: focusedMinutes,
            session_count: sessionCount,
            daily_target_minutes: dailyTarget,
            target_met: focusedMinutes >= dailyTarget,
            topics_completed: topicsCompleted,
            streak: {
                current: Number(streak.current_streak_days),
                best: Number(streak.best_streak_days)
            },
            active_topic: activeTopic
        });

    } catch (error) {
        console.error('getTodayDashboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
