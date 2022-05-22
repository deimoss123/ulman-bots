import { InteractionReplyOptions } from 'discord.js';

const wrongKeyEmbed: InteractionReplyOptions = {
  embeds: [
    {
      description: 'Tev ir jāizvēlas kāda lieta no saraksta',
      color: '#9d2235',
    },
  ],
  ephemeral: true,
};

export default wrongKeyEmbed;