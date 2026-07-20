import type { Request, Response } from 'express';
import db from '../db/database.js';
import crypto from 'crypto';

const DEFAULT_USER_ID = 'default-user-id-001';

export const getQuizzesByTopic = async (req: Request, res: Response) => {
    try {
        const topicId = Number(req.params.topicId);
        if (isNaN(topicId)) {
            return res.status(400).json({ error: 'Invalid topic ID' });
        }

        const quizzesRes = await db.execute({
            sql: `SELECT * FROM quizzes WHERE topic_id = ?`,
            args: [topicId]
        });

        res.json(quizzesRes.rows);
    } catch (error) {
        console.error('getQuizzesByTopic error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const submitQuizAttempt = async (req: Request, res: Response) => {
    try {
        const quizId = req.params.id;
        const { selected_option } = req.body;

        if (selected_option === undefined) {
            return res.status(400).json({ error: 'selected_option is required' });
        }

        const quizRes = await db.execute({
            sql: `SELECT * FROM quizzes WHERE id = ?`,
            args: [quizId as string]
        });

        if (quizRes.rows.length === 0) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        const quiz = quizRes.rows[0];
        const isCorrect = Number(quiz.correct_option) === selected_option;

        await db.execute({
            sql: `
                INSERT INTO quiz_attempts (id, user_id, quiz_id, selected_option, is_correct, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `,
            args: [crypto.randomUUID(), DEFAULT_USER_ID, quizId, selected_option, isCorrect ? 1 : 0, new Date().toISOString()]
        });

        res.json({
            is_correct: isCorrect,
            correct_option: Number(quiz.correct_option),
            explanation: quiz.explanation
        });
    } catch (error) {
        console.error('submitQuizAttempt error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
