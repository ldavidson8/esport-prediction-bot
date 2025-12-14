import { Migrator, FileMigrationProvider } from "kysely";
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { getDb, destroyDb } from "../src/database/database.js";

async function runMigrations() {
  const db = await getDb();

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(process.cwd(), "src", "database", "migrations"),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((res) => {
    console.log(`${res.migrationName}: ${res.status}`);
  });

  if (error) {
    console.error("Migration failed:", error);
    await destroyDb();
    process.exit(1);
  }

  await destroyDb();
}

runMigrations().catch(async (err) => {
  console.error("Unexpected migration error:", err);
  await destroyDb();
  process.exit(1);
});
