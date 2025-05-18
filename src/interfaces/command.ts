import {
	type ChatInputCommandInteraction,
	type PermissionResolvable,
	type RESTPostAPIApplicationCommandsJSONBody,
	type RESTPostAPIApplicationGuildCommandsJSONBody,
	type AutocompleteInteraction,
} from 'discord.js';

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
	autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}
