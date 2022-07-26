import { EmbedBuilder } from 'discord.js';

export default function smallEmbed(text: string, color: number) {
  return {
    embeds: [new EmbedBuilder().setDescription(text).setColor(color)],
  };
}
