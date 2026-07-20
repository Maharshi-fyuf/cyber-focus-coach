import type { Request, Response } from 'express';
import db from '../db/database.js';

const DEFAULT_USER_ID = 'default-user-id-001';

export const getSettings = async (req: Request, res: Response) => {
    try {
        const settingsRes = await db.execute({
            sql: `SELECT * FROM settings WHERE user_id = ?`,
            args: [DEFAULT_USER_ID]
        });

        if (settingsRes.rows.length === 0) {
            return res.status(404).json({ error: 'Settings not found' });
        }

        const settings = settingsRes.rows[0];
        res.json({
            ...settings,
            camera_enabled: settings.camera_enabled === 1
        });
    } catch (error) {
        console.error('getSettings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const updates = req.body;
        
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields provided for update' });
        }

        const allowedFields = ['camera_enabled', 'focus_threshold', 'idle_threshold_seconds', 'grace_period_seconds'];
        const setClauses: string[] = [];
        const args: any[] = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                setClauses.push(`${key} = ?`);
                args.push(key === 'camera_enabled' ? (value ? 1 : 0) : value);
            }
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ error: 'No valid fields provided for update' });
        }
        
        args.push(DEFAULT_USER_ID);

        await db.execute({
            sql: `UPDATE settings SET ${setClauses.join(', ')} WHERE user_id = ?`,
            args
        });

        // Return updated settings
        await getSettings(req, res);
    } catch (error) {
        console.error('updateSettings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
