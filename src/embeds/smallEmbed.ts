import { HexColorString, MessageEmbed } from 'discord.js';

export default function smallEmbed(text: string, color: string) {
  return {
    embeds: [new MessageEmbed().setDescription(text).setColor(color as HexColorString)],
  };
}
