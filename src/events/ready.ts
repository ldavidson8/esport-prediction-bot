import { Events } from 'discord.js';
import type { Event } from '../interfaces/event.js';
import { logger } from '../utils/logger.js';
import { setupGlobalListeners, startScheduleProcessor } from '../services/scheduler.js';

const event: Event = {
    name: Events.ClientReady,
    once: true,
    execute: async client => {
        if (!client.user) {
            logger.error('Client user is not available');
            return;
        }
        logger.info(`\nReady! Logged in as ${client.user?.tag} (${client.user?.id})`);

        setupGlobalListeners(client);
        startScheduleProcessor(client);
    },
};

export default event;
