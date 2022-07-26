import { EmbedBuilder, InteractionReplyOptions } from 'discord.js';

const wrongKeyEmbed: InteractionReplyOptions = {
  embeds: [
    new EmbedBuilder().setDescription('Tev ir jāizvēlas kāda lieta no saraksta').setColor(0x9d2235),
  ],
  ephemeral: true,
};

export default wrongKeyEmbed;
