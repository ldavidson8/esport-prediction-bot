import { CronJob } from 'cron';
import { runLiquipediaSync } from './jobs/liquipedia-cron.js';
import { logger } from './utils/logger.js';
import type { CustomClient } from './classes/client.js';
import { MatchNotificationService } from './services/match-notification.js';

let liquipediaSyncJob: CronJob | null = null;
let matchNotificationJob: CronJob | null = null;

export function startAllSchedulers(client: CustomClient): void {
	// Start Liquipedia sync job (every hour)
	startLiquipediaScheduler();

	// Start match notification job (every hour)
	startMatchNotificationScheduler(client);

	logger.info('All schedulers started successfully');
}

function startLiquipediaScheduler(): void {
	if (liquipediaSyncJob) {
		liquipediaSyncJob.stop();
	}

	// Run every hour at minute 0
	liquipediaSyncJob = new CronJob(
		'0 * * * *', // cron pattern: "at minute 0 of every hour"
		async () => {
			try {
				await runLiquipediaSync();
			} catch (error) {
				logger.error('Liquipedia sync job failed:', error);
			}
		},
		null, // onComplete callback
		true, // start immediately
		'UTC', // timezone
	);

	// Run immediately on startup (optional)
	setTimeout(async () => {
		try {
			logger.info('Running initial Liquipedia sync on startup');
			await runLiquipediaSync();
		} catch (error) {
			logger.error('Initial Liquipedia sync failed:', error);
		}
	}, 5000); // Wait 5 seconds after startup

	logger.info('Liquipedia sync scheduler started - running every hour');
}

function startMatchNotificationScheduler(client: CustomClient): void {
	if (matchNotificationJob) {
		matchNotificationJob.stop();
	}

	// Run every hour at minute 30 (offset from sync job)
	matchNotificationJob = new CronJob(
		'30 * * * *', // cron pattern: "at minute 30 of every hour"
		async () => {
			try {
				logger.info('Running 48-hour match notification job...');
				const notificationService = new MatchNotificationService(client);
				await notificationService.postMatchNotifications();
				logger.info('48-hour match notification job completed');
			} catch (error) {
				logger.error('48-hour match notification job failed:', error);
			}
		},
		null, // onComplete callback
		true, // start immediately
		'UTC', // timezone
	);

	logger.info('Match notification scheduler started - running every hour at 30 minutes');
}

export function stopAllSchedulers(): void {
	if (liquipediaSyncJob) {
		liquipediaSyncJob.stop();
		liquipediaSyncJob = null;
		logger.info('Liquipedia sync scheduler stopped');
	}

	if (matchNotificationJob) {
		matchNotificationJob.stop();
		matchNotificationJob = null;
		logger.info('Match notification scheduler stopped');
	}

	logger.info('All schedulers stopped');
}

// Individual stop functions for flexibility
export function stopLiquipediaScheduler(): void {
	if (liquipediaSyncJob) {
		liquipediaSyncJob.stop();
		liquipediaSyncJob = null;
		logger.info('Liquipedia sync scheduler stopped');
	}
}

export function stopMatchNotificationScheduler(): void {
	if (matchNotificationJob) {
		matchNotificationJob.stop();
		matchNotificationJob = null;
		logger.info('Match notification scheduler stopped');
	}
}
