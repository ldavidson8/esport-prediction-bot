import { CronJob } from "cron";
import { logger } from "../utils/logger.js";
import type { CustomClient } from "../classes/client.js";
import { MatchNotificationService } from "../services/match-notification.js";

let matchNotificationJob: CronJob | null = null;

export const startMatchNotificationJob = (client: CustomClient) => {
  if (matchNotificationJob) {
    matchNotificationJob.stop();
  }

  // Run every hour at minute 0 (e.g., 1:00, 2:00, 3:00, etc.)
  matchNotificationJob = new CronJob(
    "0 * * * *",
    async () => {
      try {
        logger.info("Running 48-hour match notification job...");
        const notificationService = new MatchNotificationService(client);
        await notificationService.postMatchNotifications();
        logger.info("48-hour match notification job completed");
      } catch (error) {
        logger.error(error, "Error in 48-hour match notification job:");
      }
    },
    null,
    true,
    "UTC", // Use UTC for consistency
  );

  logger.info("48-hour match notification job started");
};

export const stopMatchNotificationJob = () => {
  if (matchNotificationJob) {
    matchNotificationJob.stop();
    matchNotificationJob = null;
    logger.info("48-hour match notification job stopped");
  }
};
