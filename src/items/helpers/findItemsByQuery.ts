import Item from '../../interfaces/Item';
import normalizeLatText from '../../embeds/helpers/normalizeLatText';
import { search } from 'fast-fuzzy';

export default function findItemsByQuery(query: string, itemsToQuery: [string, Item][]): [string, Item][] {
  const fuzzyRes = search(query, itemsToQuery, {
    keySelector: obj => normalizeLatText(obj[1].nameNomVsk),
    ignoreCase: true,
    returnMatchData: true,
  });

  if (!query.length || !fuzzyRes.length) {
    return itemsToQuery.slice(0, 25);
  }

  return fuzzyRes.map(obj => obj.item).slice(0, 25);
}
