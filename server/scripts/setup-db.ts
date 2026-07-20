import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../src/db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
    console.log('[Setup] Starting database initialization...');

    try {
        // Enforce Pragma settings
        await db.execute('PRAGMA journal_mode = WAL;');
        await db.execute('PRAGMA foreign_keys = ON;');

        // 1. Run Schema
        const schemaPath = path.resolve(__dirname, '../src/db/schema.sql');
        console.log(`[Setup] Reading schema from ${schemaPath}`);
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('[Setup] Executing schema...');
        await db.executeMultiple(schemaSql);
        console.log('[Setup] Schema executed successfully.');

        // 2. Run Seed
        const seedPath = path.resolve(__dirname, '../src/db/seed.sql');
        console.log(`[Setup] Reading seed data from ${seedPath}`);
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        
        console.log('[Setup] Executing seed data...');
        await db.executeMultiple(seedSql);
        console.log('[Setup] Seed data executed successfully.');

        // 3. Verify
        const userCount = await db.execute('SELECT COUNT(*) as count FROM users');
        const topicCount = await db.execute('SELECT COUNT(*) as count FROM roadmap_topics');
        
        console.log(`[Setup] Verification:`);
        console.log(`  - Users: ${userCount.rows[0].count}`);
        console.log(`  - Roadmap Topics: ${topicCount.rows[0].count}`);
        
        console.log('[Setup] Database initialization complete! ✅');
    } catch (error) {
        console.error('[Setup] Error initializing database:', error);
        process.exit(1);
    }
}

setupDatabase();
