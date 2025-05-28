import { CustomClient } from './classes/client.js';
import { startHeartbeatJob } from './jobs/test.js';
const client = new CustomClient();

client.start();

client.once('ready', () => {
    startHeartbeatJob();
});