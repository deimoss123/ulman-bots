import { InteractionReplyOptions } from 'discord.js';
import findSimilarIds from './helpers/findSimilarIds';
import { Rating } from 'string-similarity';
import normalizeLatText from './helpers/normalizeLatText';

export default function wrongIdEmbed(id: string): InteractionReplyOptions {
  let giveSuggestion = false;
  let similarId: Rating;

  id = normalizeLatText(id).toLowerCase()

  if (id.length >= 3) {
    similarId = findSimilarIds(id);
    if (similarId.rating > 0.5) giveSuggestion = true;
  }

  return {
    embeds: [
      {
        description:
          'Nepareizi ievadīts id (šāda lieta neeksistē)' +
          (giveSuggestion ? `\nVai tu domāji "**${similarId!.target}**?"` : '')
        ,
        color: '#9d2235',
      },
    ],
    ephemeral: true,
  };
}