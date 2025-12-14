import { CronJob } from "cron";
import { runLiquipediaSync } from "./jobs/liquipedia-cron.js";
import { logger } from "./utils/logger.js";
import type { CustomClient } from "./classes/client.js";
import { MatchNotificationService } from "./services/match-notification.js";

let liquipediaSyncJob: CronJob | null = null;
let matchNotificationJob: CronJob | null = null;

export function startAllSchedulers(client: CustomClient): void {
  startLiquipediaScheduler();

  startMatchNotificationScheduler(client);

  logger.info("All schedulers started successfully");
}

function startLiquipediaScheduler(): void {
  if (liquipediaSyncJob) {
    liquipediaSyncJob.stop();
  }

  liquipediaSyncJob = new CronJob(
    "0 * * * *",
    async () => {
      try {
        await runLiquipediaSync();
      } catch (error) {
        logger.error(error, "Liquipedia sync job failed:");
      }
    },
    null,
    true,
    "UTC",
  );

  setTimeout(async () => {
    try {
      logger.info("Running initial Liquipedia sync on startup");
      await runLiquipediaSync();
    } catch (error) {
      logger.error(error, "Initial Liquipedia sync failed:");
    }
  }, 5000);

  logger.info("Liquipedia sync scheduler started - running every hour");
}

function startMatchNotificationScheduler(client: CustomClient): void {
  if (matchNotificationJob) {
    matchNotificationJob.stop();
  }

  matchNotificationJob = new CronJob(
    "30 * * * *",
    async () => {
      try {
        logger.info("Running 48-hour match notification job...");
        const notificationService = new MatchNotificationService(client);
        await notificationService.postMatchNotifications();
        logger.info("48-hour match notification job completed");
      } catch (error) {
        logger.error(error, "48-hour match notification job failed:");
      }
    },
    null,
    true,
    "UTC",
  );

  logger.info("Match notification scheduler started - running every hour at 30 minutes");
}

export function stopAllSchedulers(): void {
  if (liquipediaSyncJob) {
    liquipediaSyncJob.stop();
    liquipediaSyncJob = null;
    logger.info("Liquipedia sync scheduler stopped");
  }

  if (matchNotificationJob) {
    matchNotificationJob.stop();
    matchNotificationJob = null;
    logger.info("Match notification scheduler stopped");
  }

  logger.info("All schedulers stopped");
}

export function stopLiquipediaScheduler(): void {
  if (liquipediaSyncJob) {
    liquipediaSyncJob.stop();
    liquipediaSyncJob = null;
    logger.info("Liquipedia sync scheduler stopped");
  }
}

export function stopMatchNotificationScheduler(): void {
  if (matchNotificationJob) {
    matchNotificationJob.stop();
    matchNotificationJob = null;
    logger.info("Match notification scheduler stopped");
  }
}
