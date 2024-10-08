import { CustomClient } from './classes/client.js';
import { initDatabase } from './database/database.js';
import { startScheduleProcessor } from './services/scheduler.js';

const client = new CustomClient();

initDatabase();
startScheduleProcessor(client);
client.start();
