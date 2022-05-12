import { InteractionReplyOptions } from 'discord.js';
import findSimilarIds from './helpers/findSimilarIds';
import { Rating } from 'string-similarity';

export default function wrongIdEmbed(id: string): InteractionReplyOptions {
  let giveSuggestion = false;
  let similarId: Rating;

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