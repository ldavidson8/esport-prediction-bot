import { CronJob } from "cron";

import { logger } from "../utils/logger.js";

export const startHeartbeatJob = () => {
  const job = new CronJob(
    '* * * * * *', // every second
    () => {
      logger.info(`[${new Date().toISOString()}] Heartbeat`);
    },
    null,
    true,
    'Europe/London'
  );
};
