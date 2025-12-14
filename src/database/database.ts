import SQLite from "better-sqlite3";
import path from "node:path";
import { Kysely, SqliteDialect, CamelCasePlugin } from "kysely";
import type { DB } from "./kysely-types.js";
import { promises as fs } from "node:fs";
import { env } from "../env.js";
import { logger } from "../utils/logger.js";

let dbInstance: Kysely<DB> | null = null;

export async function getDb(): Promise<Kysely<DB>> {
  if (!dbInstance) {
    const dialect = await createSqliteDialect();

    dbInstance = new Kysely<DB>({
      dialect,
      plugins: [new CamelCasePlugin()],
    });
  }
  return dbInstance;
}

export async function destroyDb(): Promise<void> {
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = null;
  }
}

async function createSqliteDialect(): Promise<SqliteDialect> {
  const dbPath = path.resolve(process.cwd(), env.DATABASE_URL);
  const dir = path.dirname(dbPath);

  await fs.mkdir(dir, { recursive: true });

  const sqlite = new SQLite(dbPath);

  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("synchronous = NORMAL");
  sqlite.pragma("busy_timeout = 5000");

  logger.info(`SQLite database ready at ${dbPath}`);

  return new SqliteDialect({
    database: sqlite,
  });
}
