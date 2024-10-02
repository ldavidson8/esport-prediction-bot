import { CustomClient } from './classes/client.js';
import { initDatabase } from './database/database.js';

const client = new CustomClient();

initDatabase();
client.start();
