import type { Request, Response } from 'express';
import db from '../db/database.js';
import crypto from 'crypto';

const DEFAULT_USER_ID = 'default-user-id-001';

export const createOrUpdateLog = async (req: Request, res: Response) => {
    try {
        const { log_date, topic_id, summary, wins, blockers, next_step } = req.body;

        if (!log_date) {
            return res.status(400).json({ error: 'log_date is required' });
        }

        const now = new Date().toISOString();

        await db.execute({
            sql: `
                INSERT INTO daily_logs (id, user_id, log_date, topic_id, summary, wins, blockers, next_step, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_id, log_date) DO UPDATE SET
                    summary = excluded.summary,
                    wins = excluded.wins,
                    blockers = excluded.blockers,
                    next_step = excluded.next_step,
                    topic_id = excluded.topic_id
            `,
            args: [crypto.randomUUID(), DEFAULT_USER_ID, log_date, topic_id || null, summary || '', wins || '', blockers || '', next_step || '', now]
        });

        const logRes = await db.execute({
            sql: `SELECT * FROM daily_logs WHERE user_id = ? AND log_date = ?`,
            args: [DEFAULT_USER_ID, log_date]
        });

        res.json(logRes.rows[0]);
    } catch (error) {
        console.error('createOrUpdateLog error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getLogByDate = async (req: Request, res: Response) => {
    try {
        const { date } = req.params;

        const logRes = await db.execute({
            sql: `SELECT * FROM daily_logs WHERE user_id = ? AND log_date = ?`,
            args: [DEFAULT_USER_ID, date as string]
        });

        if (logRes.rows.length === 0) {
            return res.json(null);
        }

        res.json(logRes.rows[0]);
    } catch (error) {
        console.error('getLogByDate error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAllLogs = async (req: Request, res: Response) => {
    try {
        const logsRes = await db.execute({
            sql: `SELECT * FROM daily_logs WHERE user_id = ? ORDER BY log_date DESC`,
            args: [DEFAULT_USER_ID]
        });
        res.json(logsRes.rows);
    } catch (error) {
        console.error('getAllLogs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
