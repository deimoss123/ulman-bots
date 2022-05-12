import Item from '../../interfaces/Item';
import itemList from '../itemList';
import normalizeLatText from '../../embeds/helpers/normalizeLatText';

// atrod mantu itemList sarakstā pēc id
export default function(idToFind: string): { key: string, item: Item } | undefined {
  const id = normalizeLatText(idToFind);

  const result = Object.entries(itemList).find(([key, item]) => item.ids.includes(id));
  if (!result) return;

  return {
    key: result[0],
    item: result[1],
  };
}