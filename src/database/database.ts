import Database from 'better-sqlite3';
import { logger } from '../utils/logger.js';
import type { PostedMatch } from '../interfaces/leagueEvent.js';
import fs from 'node:fs';
import path from 'node:path';

const dbDirectory = path.resolve('data');
if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
}

const dbPath = path.join(dbDirectory, 'data.db');
const db: Database.Database = new Database(dbPath);

export function initDatabase(): void {
    db.exec(`
    CREATE TABLE IF NOT EXISTS posted_matches (
    id TEXT PRIMARY KEY,
    posted_at INTEGER,
    message_id TEXT,
    channel_id TEXT,
    guild_id TEXT
    );
    CREATE TABLE IF NOT EXISTS user_predictions (
    match_id TEXT,
    user_id TEXT,
    prediction TEXT,
    is_correct INTEGER,
    PRIMARY KEY (match_id, user_id)
    );
`);
}

export function isMatchPosted(matchId: string): boolean {
    const match = db.prepare('SELECT * FROM posted_matches WHERE id = ?').get(matchId);
    return !!match;
}

export function addPostedMatch(
    matchId: string,
    messageId: string,
    channelId: string,
    guildId: string
): void {
    const stmt = db.prepare(
        'INSERT OR REPLACE INTO posted_matches (id, posted_at, message_id, channel_id, guild_id) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(matchId, Date.now(), messageId, channelId, guildId);
    logger.info(`Added match ${matchId} to posted_matches`);
}

export function upsertUserPrediction(matchId: string, userId: string, prediction: string): void {
    const stmt = db.prepare(
        'INSERT OR REPLACE INTO user_predictions (match_id, user_id, prediction, is_correct) VALUES (?, ?, ?, ?)'
    );
    stmt.run(matchId, userId, prediction, null);
}

export function deleteUserPrediction(matchId: string, userId: string): void {
    db.prepare('DELETE FROM user_predictions WHERE match_id = ? AND user_id = ?').run(
        matchId,
        userId
    );
}

export function getPastMatches(twentyFourHoursAgo: number): PostedMatch[] {
    const result = db
        .prepare('SELECT * FROM posted_matches WHERE posted_at < ?')
        .all(twentyFourHoursAgo);
    return result as PostedMatch[];
}

export function deleteMatchById(matchId: string): void {
    db.prepare('DELETE FROM posted_matches WHERE id = ?').run(matchId);
}

export function updatePredictions(matchId: string, winner: string): void {
    const stmt = db.prepare(
        'UPDATE user_predictions SET is_correct = CASE WHEN prediction = ? THEN 1 ELSE 0 END WHERE match_id = ?'
    );
    stmt.run(winner, matchId);
}

export default db;
