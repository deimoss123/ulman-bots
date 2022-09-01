import Item from '../../interfaces/Item';
import stringSimilarity from 'string-similarity';
import normalizeLatText from '../../embeds/helpers/normalizeLatText';

type ItemWithRating = [string, Item, number];

function removeRating(item: ItemWithRating): [string, Item] {
  return [item[0], item[1]];
}

function filterGreaterThan(num: number) {
  return (item: ItemWithRating) => item[2] >= num;
}

export default function findItemsByQuery(
  query: string,
  itemsToQuery: [string, Item][]
): [string, Item][] {
  const itemsToQueryNames = itemsToQuery.map(([, item]) => normalizeLatText(item.nameNomVsk));
  const queryResult = stringSimilarity.findBestMatch(query, itemsToQueryNames);

  if (queryResult.bestMatch.rating === 0) {
    return itemsToQuery;
  }

  // pievieno reitingu katrai mantai sarakstā
  const itemsWithRatings: ItemWithRating[] = queryResult.ratings.map(({ rating }, index) => [
    ...itemsToQuery[index],
    rating,
  ]);

  // sakārto pēc reitinga
  const sortedItemsWithRatings = itemsWithRatings.sort((a, b) => b[2] - a[2]);

  // console.log(sortedItemsWithRatings.map(a => [a[0], a[2]]));

  // izfiltrē mantas ar retinga soli 0.1
  // ja lielākais reitings ir 0.3, tad tiek filtrētas mantas tikai ar reitingu kas lielāks par 0.3
  // ja lielāks par 0.5, tad filtrētas pēc 0.5 utt.
  const highestValue = Math.floor(queryResult.bestMatch.rating * 10) / 10;
  return sortedItemsWithRatings.filter(filterGreaterThan(highestValue)).map(removeRating);
}
