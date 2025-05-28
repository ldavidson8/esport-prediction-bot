import { LiquipediaSyncService } from '../services/liquipedia-sync.js';
import { logger } from '../utils/logger.js';

export async function runLiquipediaSync(): Promise<void> {
	const syncService = new LiquipediaSyncService();

	try {
		logger.info('Starting scheduled Liquipedia sync job for League of Legends and Valorant');
		await syncService.fetchAndSyncMatches();
		logger.info('Scheduled Liquipedia sync job completed successfully');
	} catch (error) {
		logger.error('Scheduled Liquipedia sync job failed:', error);
		throw error;
	}
}

// For manual execution
if (import.meta.url === `file://${process.argv[1]}`) {
	runLiquipediaSync()
		.then(() => {
			console.log('Manual sync completed for both League of Legends and Valorant');
			process.exit(0);
		})
		.catch((error) => {
			console.error('Manual sync failed:', error);
			process.exit(1);
		});
}
