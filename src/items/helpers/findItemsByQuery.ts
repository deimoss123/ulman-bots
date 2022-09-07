import Item from '../../interfaces/Item';
import stringSimilarity from 'string-similarity';
import normalizeLatText from '../../embeds/helpers/normalizeLatText';

type ItemWithRating = [string, Item, number];

function removeRating(item: ItemWithRating): [string, Item] {
  return [item[0], item[1]];
}

function filterGreaterThan(num: number) {
  return (item: ItemWithRating) => item[2] >= num - 0.2;
}

export default function findItemsByQuery(
  query: string,
  itemsToQuery: [string, Item][]
): [string, Item][] {
  const itemsToQueryNames = itemsToQuery.map(([, item]) => normalizeLatText(item.nameNomVsk));
  const queryResult = stringSimilarity.findBestMatch(query, itemsToQueryNames);

  if (queryResult.bestMatch.rating === 0) {
    return itemsToQuery.slice(0, 25);
  }

  // pievieno reitingu katrai mantai sarakstā
  const itemsWithRatings: ItemWithRating[] = queryResult.ratings.map(({ rating }, index) => [
    ...itemsToQuery[index],
    rating,
  ]);

  // sakārto pēc reitinga
  const sortedItemsWithRatings = itemsWithRatings.sort((a, b) => b[2] - a[2]);

  // console.log(sortedItemsWithRatings.map(a => [a[0], a[2]]));

  return sortedItemsWithRatings
    .filter(filterGreaterThan(queryResult.bestMatch.rating))
    .map(removeRating)
    .slice(0, 25);
}
