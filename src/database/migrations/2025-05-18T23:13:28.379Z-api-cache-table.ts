import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('api_cache')
		.ifNotExists()
		.addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
		.addColumn('request_key', 'text', (col) => col.notNull().unique())
		.addColumn('response_data', 'text', (col) => col.notNull())
		.addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
		.addColumn('expires_at', 'timestamp', (col) => col.notNull())
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('api_cache').ifExists().execute();
}
