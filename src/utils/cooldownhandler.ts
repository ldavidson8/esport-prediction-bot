import { Collection, type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import type { CustomClient } from '../classes/client.js';
import type { Command } from '../interfaces/command.js';

export async function checkCooldown(
	client: CustomClient,
	interaction: ChatInputCommandInteraction,
	command: Command,
): Promise<boolean> {
	const cooldownAmount = (command.opt?.cooldown || 0) * 1000; // cooldown in seconds

	if (cooldownAmount <= 0) {
		return true; // No cooldown
	}

	const { cooldowns } = client;
	const userId = interaction.user.id;
	const commandName = command.data.name;

	if (!cooldowns.has(commandName)) {
		cooldowns.set(commandName, new Collection());
	}

	const commandCooldowns = cooldowns.get(commandName)!;
	const now = Date.now();
	const expirationTime = commandCooldowns.get(userId);

	// Check if the user is currently on cooldown for this command
	if (expirationTime && now < expirationTime) {
		const timeLeft = (expirationTime - now) / 1000;
		await interaction.reply({
			content: `Please wait ${timeLeft.toFixed(1)} more second(s) before using the \`${commandName}\` command again.`,
			flags: MessageFlags.Ephemeral,
		});
		return false; // command should not proceed
	}

	// User is not on cooldown, set the new cooldown
	commandCooldowns.set(userId, now + cooldownAmount);

	setTimeout(() => {
		if (commandCooldowns.get(userId) === now + cooldownAmount) {
			commandCooldowns.delete(userId);
		}
	}, cooldownAmount);

	return true; // Indicate that the command can proceed
}
