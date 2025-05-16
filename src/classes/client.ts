import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { env } from '../env.js';
import type { Command } from '../interfaces/command.js';
import type { Event } from '../interfaces/event.js';
import { fileURLToPath, URL } from 'node:url';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '../utils/logger.js';

export class CustomClient extends Client {
	commands: Collection<string, Command>;

	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMessageReactions,
			],
			failIfNotExists: true,
			rest: {
				retries: 3,
				timeout: 15_000,
			},
		});
		this.commands = new Collection<string, Command>();
	}

	start() {
		this.loadCommands();
		this.loadEvents();
		this.login(env.DISCORD_TOKEN);
	}

	private async loadCommands() {
		const commandFolderPath = fileURLToPath(new URL('../commands', import.meta.url));

		const loadDir = async (dir: string) => {
			for (const entry of readdirSync(dir, { withFileTypes: true })) {
				const fullPath = join(dir, entry.name);
				if (entry.isDirectory()) {
					await loadDir(fullPath);
				} else if (entry.isFile() && entry.name.endsWith('.js')) {
					try {
						const commandModule = await import(fullPath);
						const command = commandModule.default as Command;
						this.commands.set(command.data.name, command);
						logger.info(`Command ${command.data.name} loaded`);
					} catch (error) {
						logger.error(`Failed to load command ${entry.name}:`, error);
					}
				}
			}
		};

		await loadDir(commandFolderPath);
	}

	private async loadEvents() {
		const eventFolderPath = fileURLToPath(new URL('../events', import.meta.url));
		const eventFiles = readdirSync(eventFolderPath).filter((file) => file.endsWith('.js'));
		for (const file of eventFiles) {
			const filePath = join(eventFolderPath, file);
			try {
				const eventModule = await import(filePath);
				const event = eventModule.default as Event;

				if (event.once) {
					this.once(event.name, (...args) => event.execute(this, ...args));
				} else {
					this.on(event.name, (...args) => event.execute(this, ...args));
				}

				logger.info(`Event ${event.name} loaded`);
			} catch (error) {
				logger.error(`Failed to load event ${file}:`, error);
			}
		}
	}
}
