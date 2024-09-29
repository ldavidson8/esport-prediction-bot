import Database from 'better-sqlite3';
import { logger } from '../utils/logger.js';

let db: Database.Database;

export function initDB(): void {
    db = new Database('./data.db', { verbose: console.log });
    createTables();
    logger.info('Database connected');
}

function createTables(): void {
    db.exec(`
        CREATE TABLE IF NOT EXISTS cache (
            key TEXT PRIMARY KEY,
            value TEXT,
            timestamp INTEGER
        )
    `);
}
