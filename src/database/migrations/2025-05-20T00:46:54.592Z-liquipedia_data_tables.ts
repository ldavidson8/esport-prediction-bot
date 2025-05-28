import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// Tournaments table
	await db.schema
		.createTable('tournaments')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('shortname', 'text')
		.addColumn('series', 'text')
		.addColumn('game', 'text', (col) => col.notNull())
		.addColumn('liquipedia_tier', 'text')
		.addColumn('publisher_tier', 'text')
		.addColumn('icon_url', 'text')
		.addColumn('icon_dark_url', 'text')
		.addColumn('created_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn('updated_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.execute();

	// Teams table
	await db.schema
		.createTable('teams')
		.addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('template', 'text')
		.addColumn('shortname', 'text')
		.addColumn('bracket_name', 'text')
		.addColumn('icon', 'text')
		.addColumn('icon_url', 'text')
		.addColumn('icon_dark_url', 'text')
		.addColumn('created_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn('updated_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.execute();

	// Players table
	await db.schema
		.createTable('players')
		.addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('display_name', 'text')
		.addColumn('flag', 'text')
		.addColumn('created_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn('updated_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.execute();

	// Matches table
	await db.schema
		.createTable('matches')
		.addColumn('id', 'text', (col) => col.primaryKey()) // match2id from API
		.addColumn('tournament_id', 'text', (col) => col.references('tournaments.id').notNull())
		.addColumn('page_id', 'integer', (col) => col.notNull())
		.addColumn('page_name', 'text', (col) => col.notNull())
		.addColumn('bracket_id', 'text', (col) => col.notNull())
		.addColumn('status', 'text')
		.addColumn('winner', 'text') // "1", "2", or empty
		.addColumn('walkover', 'text')
		.addColumn('result_type', 'text')
		.addColumn('finished', 'integer', (col) => col.notNull().defaultTo(0))
		.addColumn('mode', 'text', (col) => col.notNull())
		.addColumn('type', 'text', (col) => col.notNull())
		.addColumn('section', 'text')
		.addColumn('game', 'text', (col) => col.notNull())
		.addColumn('patch', 'text')
		.addColumn('date', 'text', (col) => col.notNull())
		.addColumn('date_exact', 'integer', (col) => col.notNull().defaultTo(0))
		.addColumn('best_of', 'integer')
		.addColumn('vod', 'text')
		.addColumn('stream_data', 'text') // JSON string
		.addColumn('links_data', 'text') // JSON string
		.addColumn('extra_data', 'text') // JSON string
		.addColumn('bracket_data', 'text') // JSON string
		.addColumn('last_fetched_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn('created_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn('updated_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.execute();

	// Match opponents table (many-to-many relationship)
	await db.schema
		.createTable('match_opponents')
		.addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
		.addColumn('match_id', 'text', (col) =>
			col.references('matches.id').onDelete('cascade').notNull(),
		)
		.addColumn('team_id', 'integer', (col) => col.references('teams.id').notNull())
		.addColumn('opponent_index', 'integer', (col) => col.notNull()) // 1 or 2
		.addColumn('score', 'integer')
		.addColumn('status', 'text')
		.addColumn('placement', 'integer')
		.addColumn('created_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.execute();

	// Match games table (individual maps/games within a match)
	await db.schema
		.createTable('match_games')
		.addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
		.addColumn('match_id', 'text', (col) =>
			col.references('matches.id').onDelete('cascade').notNull(),
		)
		.addColumn('game_number', 'integer', (col) => col.notNull())
		.addColumn('map', 'text')
		.addColumn('subgroup', 'text')
		.addColumn('team1_score', 'integer')
		.addColumn('team2_score', 'integer')
		.addColumn('winner', 'text')
		.addColumn('status', 'text')
		.addColumn('walkover', 'text')
		.addColumn('result_type', 'text')
		.addColumn('date', 'text')
		.addColumn('mode', 'text')
		.addColumn('type', 'text')
		.addColumn('game', 'text')
		.addColumn('patch', 'text')
		.addColumn('vod', 'text')
		.addColumn('length', 'text')
		.addColumn('extra_data', 'text') // JSON string
		.addColumn('participants_data', 'text') // JSON string
		.addColumn('created_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.execute();

	// Match players table (players in specific matches)
	await db.schema
		.createTable('match_players')
		.addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
		.addColumn('match_id', 'text', (col) =>
			col.references('matches.id').onDelete('cascade').notNull(),
		)
		.addColumn('team_id', 'integer', (col) => col.references('teams.id').notNull())
		.addColumn('player_id', 'integer', (col) => col.references('players.id').notNull())
		.addColumn('opponent_index', 'integer', (col) => col.notNull()) // 1 or 2
		.addColumn('created_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.execute();

	// Create indexes for efficient querying
	await db.schema
		.createIndex('idx_matches_tournament_id')
		.on('matches')
		.column('tournament_id')
		.execute();
	await db.schema.createIndex('idx_matches_date').on('matches').column('date').execute();
	await db.schema.createIndex('idx_matches_finished').on('matches').column('finished').execute();
	await db.schema.createIndex('idx_matches_winner').on('matches').column('winner').execute();
	await db.schema
		.createIndex('idx_matches_last_fetched')
		.on('matches')
		.column('last_fetched_at')
		.execute();
	await db.schema
		.createIndex('idx_match_opponents_match_id')
		.on('match_opponents')
		.column('match_id')
		.execute();
	await db.schema
		.createIndex('idx_match_games_match_id')
		.on('match_games')
		.column('match_id')
		.execute();
	await db.schema
		.createIndex('idx_match_players_match_id')
		.on('match_players')
		.column('match_id')
		.execute();
	await db.schema.createIndex('idx_teams_name').on('teams').column('name').execute();
	await db.schema.createIndex('idx_players_name').on('players').column('name').execute();

	// Create unique constraints to prevent duplicates
	await db.schema
		.createIndex('idx_match_opponents_unique')
		.on('match_opponents')
		.columns(['match_id', 'opponent_index'])
		.unique()
		.execute();
	await db.schema
		.createIndex('idx_match_games_unique')
		.on('match_games')
		.columns(['match_id', 'game_number'])
		.unique()
		.execute();
	await db.schema
		.createIndex('idx_match_players_unique')
		.on('match_players')
		.columns(['match_id', 'team_id', 'player_id'])
		.unique()
		.execute();
	await db.schema
		.createIndex('idx_teams_name_unique')
		.on('teams')
		.column('name')
		.unique()
		.execute();
	await db.schema
		.createIndex('idx_players_name_unique')
		.on('players')
		.column('name')
		.unique()
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('match_players').ifExists().execute();
	await db.schema.dropTable('match_games').ifExists().execute();
	await db.schema.dropTable('match_opponents').ifExists().execute();
	await db.schema.dropTable('matches').ifExists().execute();
	await db.schema.dropTable('players').ifExists().execute();
	await db.schema.dropTable('teams').ifExists().execute();
	await db.schema.dropTable('tournaments').ifExists().execute();
}
