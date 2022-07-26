import { EmbedBuilder, InteractionReplyOptions } from 'discord.js';

export default function ephemeralReply(description: string): InteractionReplyOptions {
  return {
    embeds: [new EmbedBuilder().setDescription(description).setColor(0x9d2235)],
    ephemeral: true,
  };
}
