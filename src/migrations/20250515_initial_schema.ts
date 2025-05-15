import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("guilds")
    .addColumn("id", "integer", (col) => col.primaryKey())
    .addColumn("guild_id", "text", (col) => col.notNull())
    .addColumn("prediction_channel_id", "text")
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn("updated_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute();

  await db.schema
    .createTable("esports")
    .addColumn("id", "integer", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("short_name", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute();

  await db.schema
    .createTable("guild_esports_settings")
    .addColumn("id", "integer", (col) => col.primaryKey())
    .addColumn("guild_id", "integer", (col) => col.notNull())
    .addColumn("esports_id", "integer", (col) => col.notNull())
    .addColumn("isenabled", "boolean", (col) => col.defaultTo(false).notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn("updated_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("guilds").execute();
  await db.schema.dropTable("esports").execute();
  await db.schema.dropTable("guild_esports_settings").execute();
}
