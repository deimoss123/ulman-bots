import { InteractionReplyOptions } from 'discord.js';
import findSimilarIds from './helpers/findSimilarIds';
import { Rating } from 'string-similarity';
import normalizeLatText from './helpers/normalizeLatText';

export default function wrongIdEmbed(id: string): InteractionReplyOptions {
  id = normalizeLatText(id).toLowerCase();

  return {
    embeds: [
      {
        description: 'Tev ir jāizvēlas kāda lieta no saraksta',
        color: '#9d2235',
      },
    ],
    ephemeral: true,
  };
}