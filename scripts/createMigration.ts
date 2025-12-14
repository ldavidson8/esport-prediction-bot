#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

async function main() {
  const rl = readline.createInterface({ input, output });

  const name = await rl.question("Enter migration name: ");
  rl.close();

  if (!name.trim()) {
    console.error("Migration name is required");
    process.exit(1);
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14);

  const slug = name.toLowerCase().trim().replace(/\s+/g, "_");

  const filename = `${timestamp}_${slug}.ts`;

  const migrationsDir = path.join(process.cwd(), "src", "database", "migrations");
  await fs.mkdir(migrationsDir, { recursive: true });

  const filePath = path.join(migrationsDir, filename);

  const template = `import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Add migration logic here
}

export async function down(db: Kysely<any>): Promise<void> {
  // Add rollback logic here
}
`;

  await fs.writeFile(filePath, template, { encoding: "utf8" });

  console.log(`Created migration: ${path.relative(process.cwd(), filePath)}`);
}

main().catch((err) => {
  console.error("Failed to create migration:", err);
  process.exit(1);
});
