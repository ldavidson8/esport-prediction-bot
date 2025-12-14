import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("tournaments")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("shortname", "text")
    .addColumn("series", "text")
    .addColumn("game", "text", (col) => col.notNull())
    .addColumn("liquipedia_tier", "text")
    .addColumn("publisher_tier", "text")
    .addColumn("icon_url", "text")
    .addColumn("icon_dark_url", "text")
    .addColumn("created_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn("updated_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute();

  await db.schema
    .createTable("teams")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("name", "text", (col) => col.notNull().unique())
    .addColumn("shortname", "text")
    .addColumn("template", "text")
    .addColumn("icon_url", "text")
    .addColumn("created_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn("updated_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute();

  await db.schema
    .createTable("matches")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("tournament_id", "text", (col) => col.references("tournaments.id").notNull())
    .addColumn("page_id", "integer", (col) => col.notNull())
    .addColumn("page_name", "text", (col) => col.notNull())
    .addColumn("bracket_id", "text", (col) => col.notNull())
    .addColumn("status", "text")
    .addColumn("winner", "text")
    .addColumn("walkover", "text")
    .addColumn("result_type", "text")
    .addColumn("finished", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("mode", "text", (col) => col.notNull())
    .addColumn("type", "text", (col) => col.notNull())
    .addColumn("section", "text")
    .addColumn("game", "text", (col) => col.notNull())
    .addColumn("patch", "text")
    .addColumn("date", "text", (col) => col.notNull())
    .addColumn("date_exact", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("best_of", "integer")

    .addColumn("team1_id", "integer", (col) => col.references("teams.id"))
    .addColumn("team1_name", "text")
    .addColumn("team1_shortname", "text")
    .addColumn("team1_template", "text")
    .addColumn("team1_score", "integer")

    .addColumn("team2_id", "integer", (col) => col.references("teams.id"))
    .addColumn("team2_name", "text")
    .addColumn("team2_shortname", "text")
    .addColumn("team2_template", "text")
    .addColumn("team2_score", "integer")

    .addColumn("vod", "text")
    .addColumn("stream_data", "text")
    .addColumn("links_data", "text")
    .addColumn("extra_data", "text")
    .addColumn("bracket_data", "text")
    .addColumn("last_fetched_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn("created_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn("updated_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute();

  await db.schema
    .createTable("match_games")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("match_id", "text", (col) =>
      col.references("matches.id").onDelete("cascade").notNull(),
    )
    .addColumn("game_number", "integer", (col) => col.notNull())
    .addColumn("map", "text")
    .addColumn("subgroup", "text")
    .addColumn("team1_score", "integer")
    .addColumn("team2_score", "integer")
    .addColumn("winner", "text")
    .addColumn("status", "text")
    .addColumn("walkover", "text")
    .addColumn("result_type", "text")
    .addColumn("date", "text")
    .addColumn("mode", "text")
    .addColumn("type", "text")
    .addColumn("game", "text")
    .addColumn("patch", "text")
    .addColumn("vod", "text")
    .addColumn("length", "text")
    .addColumn("extra_data", "text")
    .addColumn("participants_data", "text")
    .addColumn("created_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute();

  await db.schema
    .createIndex("idx_matches_tournament_id")
    .on("matches")
    .column("tournament_id")
    .execute();
  await db.schema.createIndex("idx_matches_date").on("matches").column("date").execute();
  await db.schema.createIndex("idx_matches_finished").on("matches").column("finished").execute();
  await db.schema.createIndex("idx_matches_winner").on("matches").column("winner").execute();
  await db.schema
    .createIndex("idx_matches_last_fetched")
    .on("matches")
    .column("last_fetched_at")
    .execute();
  await db.schema
    .createIndex("idx_matches_team1_name")
    .on("matches")
    .column("team1_name")
    .execute();
  await db.schema
    .createIndex("idx_matches_team2_name")
    .on("matches")
    .column("team2_name")
    .execute();
  await db.schema
    .createIndex("idx_match_games_match_id")
    .on("match_games")
    .column("match_id")
    .execute();
  await db.schema.createIndex("idx_teams_name").on("teams").column("name").execute();

  await db.schema
    .createIndex("idx_match_games_unique")
    .on("match_games")
    .columns(["match_id", "game_number"])
    .unique()
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("match_games").ifExists().execute();
  await db.schema.dropTable("matches").ifExists().execute();
  await db.schema.dropTable("teams").ifExists().execute();
  await db.schema.dropTable("tournaments").ifExists().execute();
}
