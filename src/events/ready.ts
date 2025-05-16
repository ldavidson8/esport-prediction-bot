import { Events } from 'discord.js';
import type { Event } from '../interfaces/event.js';
import { logger } from '../utils/logger.js';
import { checkPredictionConfig } from '../services/checkPredictionConfig.js';

const event: Event = {
	name: Events.ClientReady,
	once: true,
	execute: async (client) => {
		if (!client.user) {
			logger.error('Client user is not available');
			return;
		}
		logger.info(`Ready! Logged in as ${client.user?.tag} (${client.user?.id})`);
		for (const guild of client.guilds.cache.values()) {
			await checkPredictionConfig(guild, client);
		}
	},
};

export default event;
