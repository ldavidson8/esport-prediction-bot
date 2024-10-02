import { CustomClient } from '../classes/client.js';
import type { ClientEvents } from 'discord.js';

export interface Event {
    name: keyof ClientEvents;
    once?: boolean;
    execute(client: CustomClient, ...args: unknown[]): void;
}
