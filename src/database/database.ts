import SQLite from "better-sqlite3";
import path from "node:path";
import { Kysely, SqliteDialect } from "kysely";
import type { DB } from "./kysely-types.js";
import { promises as fs } from "node:fs";
import { env } from "../env.js";
import { logger } from "../utils/logger.js";

let dbInstance: Kysely<DB> | null = null;

export async function getDb(): Promise<Kysely<DB>> {
  if (!dbInstance) {
    const dialect = await setupSQliteDialect();

    dbInstance = new Kysely<DB>({
      dialect,
    });
  }
  return dbInstance;
}

async function setupSQliteDialect(): Promise<SqliteDialect> {
  const defaultDbPath = env.DATABASE_URL;

  const dataPath = "./data";
  if (!(await fs.stat(dataPath).catch(() => false))) {
    await fs.mkdir(dataPath);
    console.info(`Created directory: ${dataPath}`);

    logger.info(`Created directory: ${dataPath}`);
  }
  return new SqliteDialect({
    database: new SQLite(path.join(process.cwd(), defaultDbPath)),
  });
}
