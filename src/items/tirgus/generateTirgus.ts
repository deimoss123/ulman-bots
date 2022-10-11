import itemList, { ItemCategory, ItemKey } from '../itemList';

export type TirgusListings = ItemKey[];

export const TIRGUS_COUNT = 3;

export default function generateTirgus() {
  const tirgusItems: TirgusListings = Object.entries(itemList)
    .filter(([, item]) => item.categories.includes(ItemCategory.TIRGUS))
    .sort(() => 0.5 - Math.random())
    .map(([key]) => key);

  return tirgusItems.slice(0, TIRGUS_COUNT);
}
