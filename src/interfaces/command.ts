import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionResolvable, RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIApplicationGuildCommandsJSONBody } from "discord.js";

interface CustomOptions {
    userPermissions?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];
    category?: string;
    cooldown?: number;
}

export interface Command {
    data: RESTPostAPIApplicationCommandsJSONBody | RESTPostAPIApplicationGuildCommandsJSONBody;
    opt?: CustomOptions;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}