import { getDb } from "../database/database.js";
import { logger } from "../utils/logger.js";
import { getTeamByShortcode, getTeamByName, getEmojiMarkdown } from "../utils/teams.js";
import { Client, TextChannel, time, TimestampStyles, Message } from "discord.js";
import { addHours, formatISO, differenceInHours } from "date-fns";
import { purpleAccentColor } from "../constants.js";
import { sql } from "kysely";

export class MatchNotificationService {
  constructor(private client: Client) {}

  async getMatchesStartingIn48Hours(): Promise<any[]> {
    const db = await getDb();

    // Calculate time window: matches starting in the next 48 hours (0-48 hours from now)
    const now = new Date();
    const end48Hours = addHours(now, 48);

    // Convert to Unix timestamps for comparison (seconds since epoch)
    const nowTimestamp = Math.floor(now.getTime() / 1000);
    const end48HoursTimestamp = Math.floor(end48Hours.getTime() / 1000);

    // Add debugging
    logger.info(
      `Looking for matches between ${nowTimestamp} and ${end48HoursTimestamp} (Unix timestamps)`,
    );
    logger.info(`That's ${now.toISOString()} to ${end48Hours.toISOString()} in ISO format`);

    const matches = await db
      .selectFrom("matches")
      .innerJoin("tournaments", "matches.tournamentId", "tournaments.id")
      .select([
        "matches.id",
        "matches.date",
        "matches.bestOf",
        "matches.team1Name",
        "matches.team1Shortname",
        "matches.team2Name",
        "matches.team2Shortname",
        "tournaments.name as tournamentName",
        "tournaments.series",
        "matches.extraData",
      ])
      .where((eb) => {
        const timestampExpr = sql<number>`
        CAST(
        JSON_EXTRACT(matches.extra_data, '$.timestamp')
        AS INTEGER
        )
        `;
        return eb.and([
          eb(timestampExpr, ">=", nowTimestamp),
          eb(timestampExpr, "<=", end48HoursTimestamp),
        ]);
      })
      .execute();

    // Add debugging to see what we actually got
    logger.info(`Found ${matches.length} matches in 48-hour window`);

    // Debug the first few matches to verify time filtering
    if (matches.length > 0) {
      matches.slice(0, 3).forEach((match, index) => {
        let actualTimestamp = null;
        let hoursFromNow = "unknown";

        try {
          const extraData = JSON.parse(match.extraData || "{}");
          actualTimestamp = extraData.timestamp;
          if (actualTimestamp) {
            const matchTime = new Date(actualTimestamp * 1000); // Convert to milliseconds
            hoursFromNow = String(differenceInHours(matchTime, now));
          }
        } catch (e) {
          // Fallback to date field if extraData parsing fails
          logger.error(e, `Failed to parse extraData for match ${match.id}:`);
          const matchTime = new Date(match.date);
          hoursFromNow = String(differenceInHours(matchTime, now));
        }

        logger.info(
          `Match ${index + 1}: ${match.team1Name} vs ${match.team2Name} - ${hoursFromNow} hours from now (timestamp: ${actualTimestamp})`,
        );
      });
    }

    // Also check for any upcoming matches to see if data exists
    const allUpcoming = await db
      .selectFrom("matches")
      .select(["id", "date", "finished", "team1Name", "team2Name"])
      .where("matches.date", ">", formatISO(now))
      .where("matches.finished", "=", 0)
      .orderBy("matches.date", "asc")
      .limit(10)
      .execute();

    logger.info(`Total upcoming matches in database: ${allUpcoming.length}`);
    if (allUpcoming.length > 0) {
      const nextMatch = allUpcoming[0];
      if (nextMatch) {
        logger.info(
          `Next upcoming match: ${nextMatch.date} - ${nextMatch.team1Name} vs ${nextMatch.team2Name}`,
        );
        // Calculate hours until next match
        const nextMatchTime = new Date(nextMatch.date);
        const hoursUntil = differenceInHours(nextMatchTime, now);
        logger.info(`Hours until next match: ${hoursUntil}`);
      }
    }

    return matches;
  }

  async postMatchNotifications(): Promise<void> {
    try {
      const matches = await this.getMatchesStartingIn48Hours();

      if (matches.length === 0) {
        logger.info("No matches starting in 48 hours");
        return;
      }

      logger.info(`Found ${matches.length} matches starting in 48 hours`);

      // Get all guilds with prediction channels
      const db = await getDb();
      const guildsWithChannels = await db
        .selectFrom("guilds")
        .select(["guildId", "predictionChannelId"])
        .where("predictionChannelId", "is not", null)
        .execute();

      for (const guildConfig of guildsWithChannels) {
        if (!guildConfig.predictionChannelId) continue;

        try {
          const guild = await this.client.guilds.fetch(guildConfig.guildId);
          const channel = (await guild.channels.fetch(
            guildConfig.predictionChannelId,
          )) as TextChannel;

          if (!channel || !channel.isTextBased()) {
            logger.warn(`Invalid prediction channel for guild ${guildConfig.guildId}`);
            continue;
          }

          // Send individual messages for each match
          for (const match of matches) {
            await this.sendMatchNotification(channel, match);
          }
        } catch (error) {
          logger.error(error, `Failed to send notifications to guild ${guildConfig.guildId}:`);
        }
      }
    } catch (error) {
      logger.error(error, "Failed to post match notifications:");
    }
  }

  private async sendMatchNotification(channel: TextChannel, match: any): Promise<void> {
    try {
      // Only log key match info
      logger.info(
        `Sending match notification: ${match.team1Name} vs ${match.team2Name} (${match.id})`,
      );

      // Skip matches where teams are not yet determined (check if teams exist in DB)
      const db = await getDb();

      let team1Exists = false;
      let team2Exists = false;

      if (match.team1Name) {
        const team1 = await db
          .selectFrom("teams")
          .select("id")
          .where("name", "=", match.team1Name)
          .executeTakeFirst();
        team1Exists = !!team1;
      }

      if (match.team2Name) {
        const team2 = await db
          .selectFrom("teams")
          .select("id")
          .where("name", "=", match.team2Name)
          .executeTakeFirst();
        team2Exists = !!team2;
      }

      // Skip if either team doesn't exist in database (indicates placeholder/TBD)
      if (!team1Exists || !team2Exists) {
        logger.info(`Skipping match ${match.id}: teams not found in database`);
        return;
      }

      // Create Discord timestamp
      const matchDate = new Date(match.date);
      const discordTimestamp = time(matchDate, TimestampStyles.LongDateTime);
      const relativeTime = time(matchDate, TimestampStyles.RelativeTime);

      // Get team information using your utility functions
      const team1 = getTeamByShortcode(match.team1Shortname) || getTeamByName(match.team1Name);
      const team2 = getTeamByShortcode(match.team2Shortname) || getTeamByName(match.team2Name);

      // Use getEmojiMarkdown function for emoji lookup
      const team1Emoji =
        getEmojiMarkdown(match.team1Shortname) || getEmojiMarkdown(match.team1Name);
      const team2Emoji =
        getEmojiMarkdown(match.team2Shortname) || getEmojiMarkdown(match.team2Name);

      const team1Display = team1Emoji ? `${team1Emoji} ${match.team1Name}` : match.team1Name;
      const team2Display = team2Emoji ? `${team2Emoji} ${match.team2Name}` : match.team2Name;

      // Validate that we have proper content before creating the container
      if (!match.team1Name || !match.team2Name || !match.tournamentName) {
        return;
      }

      // Calculate hours until match
      const now = new Date();
      const hoursUntil = differenceInHours(matchDate, now);

      // Send the message
      let message: Message;
      try {
        message = await channel.send({
          embeds: [
            {
              title: `Upcoming Match in ${hoursUntil} hours`,
              description:
                `**${team1Display}** vs **${team2Display}**\n` +
                `**Tournament:** ${match.tournamentName}\n` +
                `**Start Time:** ${discordTimestamp} (${relativeTime})\n` +
                `**Best of:** ${match.bestOf || "Unknown"}`,
              color: purpleAccentColor,
            },
          ],
        });
      } catch (sendError) {
        logger.error(sendError, `Failed to send match notification for ${match.id}:`);
        throw sendError; // rethrow so fallback logic runs
      }

      // Add emoji reactions for the teams using your utility functions
      if (team1) {
        try {
          const team1EmojiMarkdown =
            getEmojiMarkdown(match.team1Shortname) || getEmojiMarkdown(match.team1Name);
          if (team1EmojiMarkdown) {
            await message.react(team1EmojiMarkdown);
          }
        } catch {}
      }

      if (team2) {
        try {
          const team2EmojiMarkdown =
            getEmojiMarkdown(match.team2Shortname) || getEmojiMarkdown(match.team2Name);
          if (team2EmojiMarkdown) {
            await message.react(team2EmojiMarkdown);
          }
        } catch {}
      }
    } catch (error) {
      logger.error(error, `Failed to send match notification for ${match.id}:`);

      // Try sending a fallback simple message if container fails
      try {
        const fallbackMessage = `**Upcoming Match in 48 hours**\n\n**${match.team1Name}** vs **${match.team2Name}**\n**${match.tournamentName}**\n**Start Time:** ${time(
          new Date(match.date),
          TimestampStyles.RelativeTime,
        )}`;
        await channel.send(fallbackMessage);
      } catch (fallbackError) {
        logger.error(fallbackError, `Failed to send fallback message for ${match.id}:`);
      }
    }
  }
}
