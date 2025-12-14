import { getDb } from "../../database/database.js";
import {
  CommandInteraction,
  MessageFlags,
  channelMention,
  PermissionFlagsBits,
  InteractionContextType,
} from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../interfaces/command.js";
import { logger } from "../../utils/logger.js";

export const metadata = new SlashCommandBuilder()
  .setName("get-prediction-channel")
  .setDescription("Gets the currently set prediction channel for this guild.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setContexts(InteractionContextType.Guild);

async function execute(interaction: CommandInteraction): Promise<void> {
  if (!interaction.guild || !interaction.guildId) {
    await interaction.reply({
      content: "This command can only be used in a server.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    const db = await getDb();
    const guildConfig = await db
      .selectFrom("guilds")
      .select("predictionChannelId")
      .where("guildId", "=", interaction.guildId)
      .executeTakeFirst();

    if (guildConfig && guildConfig.predictionChannelId) {
      await interaction.reply({
        content: `The prediction channel is currently set to ${channelMention(guildConfig.predictionChannelId)}.`,
        flags: MessageFlags.Ephemeral,
      });
      logger.info(
        `Prediction channel ${guildConfig.predictionChannelId} retrieved for guild ${interaction.guildId} by ${interaction.user.tag}`,
      );
    } else {
      await interaction.reply({
        content:
          "No prediction channel has been set for this server yet. Use `/setpredictionchannel` to set one.",
        flags: MessageFlags.Ephemeral,
      });
      logger.info(
        `No prediction channel found for guild ${interaction.guildId} when requested by ${interaction.user.tag}`,
      );
    }
  } catch (dbError: any) {
    let errorMessage = "No additional error information available.";
    if (dbError instanceof Error) {
      errorMessage = `Message: ${dbError.message}${dbError.stack ? `\nStack: ${dbError.stack}` : ""}`;
    } else if (dbError && typeof dbError === "object") {
      try {
        errorMessage = JSON.stringify(dbError);
      } catch {
        errorMessage = "Could not stringify error object.";
      }
    } else if (dbError !== undefined && dbError !== null) {
      errorMessage = String(dbError);
    }
    logger.error(
      `Database error retrieving prediction channel for guild ${interaction.guildId}: ${errorMessage}`,
    );
    await interaction.reply({
      content:
        "An error occurred while trying to retrieve the prediction channel. Please try again later.",
      flags: MessageFlags.Ephemeral,
    });
  }
}

const getPredictionChannelCommand: Command = {
  data: metadata.toJSON(),
  opt: {
    cooldown: 5,
    userPermissions: ["ManageGuild"],
    botPermissions: ["SendMessages"],
    category: "Admin",
  },
  execute,
};

export default getPredictionChannelCommand;
