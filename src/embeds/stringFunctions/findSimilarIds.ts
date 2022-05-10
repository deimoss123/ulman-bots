import stringSimilarity, { Rating } from 'string-similarity';
import itemList from '../../items/itemList';

const listOfAllItemIds = Object.values(itemList).reduce(
  (previous: string[], item) => [...previous, ...item.ids], [],
);

export default function(id: string): Rating {
  return stringSimilarity.findBestMatch(id, listOfAllItemIds).bestMatch;
}