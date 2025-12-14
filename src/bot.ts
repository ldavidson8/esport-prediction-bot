import { CustomClient } from "./classes/client.js";
import { startHeartbeatJob } from "./jobs/heartbeat.js";
import { startAllSchedulers } from "./scheduler.js";
import { MatchNotificationService } from "./services/match-notification.js";
import { logger } from "./utils/logger.js";

const client = new CustomClient();

client.once("clientReady", async () => {
  logger.info("Testing match notifications...");
  const service = new MatchNotificationService(client);
  await service.postMatchNotifications();
});

// client.once('ready', () => {
// 	startHeartbeatJob();
// 	startAllSchedulers(client);
// });

client.start();
