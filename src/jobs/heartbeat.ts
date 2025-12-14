import { CronJob } from "cron";

import { logger } from "../utils/logger.js";

let heartbeatJob: CronJob | null = null;

export const startHeartbeatJob = () => {
  if (heartbeatJob) {
    heartbeatJob.stop();
  }

  // Run every 15 seconds
  heartbeatJob = new CronJob(
    "*/15 * * * * *",
    async () => {
      try {
        logger.info("Heartbeat job running...");
      } catch (error) {
        logger.error(error, "Error in heartbeat job:");
      }
    },
    null,
    true,
    "UTC",
  );

  logger.info("Heartbeat job started");
};

export const stopHeartbeatJob = () => {
  if (heartbeatJob) {
    heartbeatJob.stop();
    heartbeatJob = null;
  }
  logger.info("Heartbeat job stopped");
};
