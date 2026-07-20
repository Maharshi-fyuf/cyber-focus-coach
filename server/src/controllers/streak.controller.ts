import type { Request, Response } from 'express';
import db from '../db/database.js';

const DEFAULT_USER_ID = 'default-user-id-001';

export const getStreaks = async (req: Request, res: Response) => {
    try {
        const streakRes = await db.execute({
            sql: `SELECT * FROM streaks WHERE user_id = ?`,
            args: [DEFAULT_USER_ID]
        });

        if (streakRes.rows.length === 0) {
            return res.json({
                current_streak_days: 0,
                best_streak_days: 0,
                last_active_date: null
            });
        }

        res.json(streakRes.rows[0]);
    } catch (error) {
        console.error('getStreaks error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
