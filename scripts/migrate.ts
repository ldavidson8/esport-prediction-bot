import SQLite from "better-sqlite3";
import { promises as fs } from "node:fs";
import process from "node:process";
import path from "node:path";
import { Kysely, Migrator, FileMigrationProvider, SqliteDialect } from "kysely";
import { env } from "../src/env.js";

async function migrateToLatest() {
  const databasePath = "./data";
  if (!(await fs.stat(databasePath).catch(() => false))) {
    await fs.mkdir(databasePath);
    console.info("Created data directory");
  }

  const defaultDbPath = env.DATABASE_URL;
  const db = new Kysely<any>({
    dialect: new SqliteDialect({
      database: new SQLite(path.join(process.cwd(), defaultDbPath)),
    }),
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(import.meta.dirname, "../src/migrations"),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.info(`Migration ${it.migrationName} applied successfully`);
    } else if (it.status === "Error") {
      console.error(`Migration ${it.migrationName} failed`);
    }
  });

  if (error) {
    console.error(`Migration failed:\n${error}`);
    process.exit(1);
  }

  await db.destroy();
}

migrateToLatest();
