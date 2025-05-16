import { Guild, Client, userMention } from 'discord.js';
import { getDb } from '../database/database.js';

export async function checkPredictionConfig(guild: Guild, client: Client) {
	const db = await getDb();
	const existing = await db
		.selectFrom('guilds')
		.select(['id'])
		.where('guildId', '=', guild.id)
		.executeTakeFirst();

	if (!existing) {
		await db
			.insertInto('guilds')
			.values({
				guildId: guild.id,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				predictionChannelId: null,
			})
			.execute();
	}

	// Check if predictionChannelId is set
	const guildSettings = await db
		.selectFrom('guilds')
		.select(['predictionChannelId'])
		.where('guildId', '=', guild.id)
		.executeTakeFirst();

	if (!guildSettings?.predictionChannelId) {
		const guildObj = await client.guilds.fetch(guild.id);
		const owner = await guildObj.fetchOwner();
		try {
			// Try to find a general text channel to send the message to
			const targetChannelNames = ['general', 'chat', 'main', 'lobby', 'discussion'];

			// Find the first text channel that matches one of our target names
			const channel = guildObj.channels.cache.find(
				(channel) =>
					channel.isTextBased() &&
					!channel.isThread() &&
					targetChannelNames.some((name) => channel.name.toLowerCase().includes(name)),
			);

			// If we found a suitable channel, send the message there
			if (channel && channel.isTextBased()) {
				// await channel.send(
				//   `${userMention(
				//     owner.id
				//   )}, your server doesn't have a prediction channel set up yet. Please run \`/setpredictionchannel\` to select one.`
				// );
				await channel.send(
					"your server doesn't have a prediction channel set up yet. Please run `/setpredictionchannel` to select one.",
				);
			} else {
				// Fallback: Send to the first text channel we can find
				const firstTextChannel = guildObj.channels.cache.find(
					(channel) => channel.isTextBased() && !channel.isThread(),
				);

				if (firstTextChannel && firstTextChannel.isTextBased()) {
					await firstTextChannel.send(
						`${userMention(
							owner.id,
						)}, your server doesn't have a prediction channel set up yet. Please run \`/setpredictionchannel\` to select one.`,
					);
				}
			}
		} catch (error) {
			console.error('Failed to send notification message:', error);
		}
	}
}
