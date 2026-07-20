import { createClient, type Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Resolve current directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the data directory exists
const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = process.env.DB_PATH 
    ? path.resolve(process.cwd(), process.env.DB_PATH) 
    : path.resolve(dataDir, 'cfc.db');

console.log(`[Database] Connecting to LibSQL (SQLite) at: ${dbPath}`);

// Initialize the database connection (LibSQL client)
// Uses a local file URI
const db: Client = createClient({
    url: `file:${dbPath.replace(/\\/g, '/')}`
});

// Since LibSQL is slightly different, PRAGMAs are executed via execute() if needed.
// By default, the local file driver in LibSQL handles WAL and foreign keys automatically,
// but we can enforce them when setting up the database.

export default db;
