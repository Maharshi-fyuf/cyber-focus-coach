import type { Request, Response } from 'express';
import db from '../db/database.js';
import crypto from 'crypto';

export const logFocusEvent = async (req: Request, res: Response) => {
    try {
        const { session_id, event_type, event_value, confidence } = req.body;

        if (!session_id || !event_type) {
            return res.status(400).json({ error: 'session_id and event_type are required' });
        }

        await db.execute({
            sql: `
                INSERT INTO focus_events (id, session_id, event_type, event_value, confidence, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            `,
            args: [
                crypto.randomUUID(),
                session_id,
                event_type,
                event_value || null,
                confidence !== undefined ? confidence : null,
                new Date().toISOString()
            ]
        });

        res.status(201).json({ success: true });
    } catch (error) {
        console.error('logFocusEvent error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
