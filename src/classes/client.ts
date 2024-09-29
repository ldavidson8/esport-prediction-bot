import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { env } from '../env.js';
import type { Command } from '../interfaces/command.js';
import { fileURLToPath, URL } from 'node:url';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '../utils/logger.js';

export class CustomClient extends Client {
    commands: Collection<string, Command>;

    constructor() {
        super({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
            failIfNotExists: true,
            rest: {
                retries: 3,
                timeout: 15_000,
            },
        });
        this.commands = new Collection<string, any>();
    }

    start() {
        this.loadCommands();
        this.login(env.DISCORD_TOKEN);
    }

    private async loadCommands() {
        const commandFolderPath = fileURLToPath(new URL('../commands', import.meta.url));
        const commandFiles = readdirSync(commandFolderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = join(commandFolderPath, file);
            try {
                const commandModule = await import(filePath);
                const command = commandModule.default as Command;
                this.commands.set(command.data.name, command);
                logger.info(`Command ${command.data.name} loaded`);
            } catch (error) {
                logger.error(`Failed to load command ${file}:`, error);
            }
        }
    }
}
