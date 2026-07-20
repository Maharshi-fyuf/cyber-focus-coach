import type { Request, Response } from 'express';
import db from '../db/database.js';

export const getRoadmap = async (req: Request, res: Response) => {
    try {
        const topicsRes = await db.execute(`SELECT * FROM roadmap_topics ORDER BY sequence_order ASC`);
        // LibSQL client returns SQLite booleans (0/1) as numbers. We map them to actual booleans for the frontend.
        const topics = topicsRes.rows.map(row => ({
            ...row,
            is_locked: row.is_locked === 1,
            is_completed: row.is_completed === 1
        }));
        res.json(topics);
    } catch (error) {
        console.error('getRoadmap error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const completeTopic = async (req: Request, res: Response) => {
    try {
        const topicId = Number(req.params.id);
        if (isNaN(topicId)) {
            return res.status(400).json({ error: 'Invalid topic ID' });
        }

        // Mark current as complete
        await db.execute({
            sql: `UPDATE roadmap_topics SET is_completed = 1 WHERE id = ?`,
            args: [topicId]
        });

        // Unlock next topic
        await db.execute({
            sql: `UPDATE roadmap_topics SET is_locked = 0 WHERE prerequisite_topic_id = ?`,
            args: [topicId]
        });

        res.json({ success: true });
    } catch (error) {
        console.error('completeTopic error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
