import { InteractionReplyOptions } from 'discord.js';

export default function ephemeralReply(description: string) {
  return {
    embeds: [
      {
        description,
        color: '#9d2235',
      },
    ],
    ephemeral: true,
  } as InteractionReplyOptions;
}