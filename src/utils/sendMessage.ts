import { TextChannel } from 'discord.js';
import type { CustomClient } from '../classes/client.js';
import { logger } from './logger.js';

async function sendMessage(client: CustomClient, channelName: string, message: string) {
    for (const guild of client.guilds.cache.values()) {
        const channel = guild.channels.cache.find(
            ch => ch.name === channelName && ch instanceof TextChannel && ch.isTextBased()
        ) as TextChannel | undefined;

        if (channel) {
            try {
                await channel.send(message);
                logger.info(`Message sent to ${channelName} in ${guild.name}`);
            } catch (error) {
                logger.error(`Failed to send message to ${channelName} in ${guild.name}`, error);
            }
        }
    }
}

export { sendMessage };
