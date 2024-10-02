import { Guild, TextChannel, GuildChannel, ChannelType } from 'discord.js';
import { logger } from './logger.js';

export function findPredictionsChannel(guild: Guild): TextChannel | null {
    const channel = guild.channels.cache.find(
        channel =>
            channel.type === ChannelType.GuildText &&
            channel instanceof GuildChannel &&
            channel.name.toLowerCase().includes('predictions')
    ) as TextChannel;

    if (!channel) {
        logger.warn(`No predictions channel found in guild ${guild.name}`);
    }

    return channel;
}

export async function createPredictionsChannel(guild: Guild): Promise<TextChannel> {
    return await guild.channels.create({
        name: 'bot-predictions',
        type: ChannelType.GuildText,
    });
}

export async function ensurePredictionsChannel(guild: Guild): Promise<TextChannel> {
    let channel = findPredictionsChannel(guild);
    if (!channel) {
        logger.warn(`No predictions channel found in guild ${guild.name}`);
        channel = await createPredictionsChannel(guild);
    }
    return channel;
}
