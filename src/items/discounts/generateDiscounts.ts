import itemList, { ItemCategory } from '../itemList';

// mantas cena = pilnā cena * (1 - atlaide)
const MIN_DISCOUNT = 0.05;
const MAX_DISCOUNT = 0.25;

const MAX_ITEMS = 3;
const MIN_ITEMS = 1;

export interface DiscountedItems {
  [key: string]: number;
}

export default function generateDiscounts() {
  // saraksts ar mantām kurām var būt atlaides
  let discountableItems = Object.entries(itemList).filter(
    ([_, item]) => item.categories.includes(ItemCategory.VEIKALS) && item.allowDiscount,
  ).map(([key, _]) => key);

  // nejauši izvēlās cik mantām būs atlaides
  let discountCount = Math.floor(Math.random() * MAX_ITEMS) + MIN_ITEMS;

  // objekts ar mantām kam būs atlaides
  let discountedItems: Record<string, number> = {};

  while (discountCount-- > 0) {
    // nejauši izvēlās indeksu
    const index = Math.floor(Math.random() * discountableItems.length);
    const item = discountableItems[index];

    // nejauši izvēlēta atlaide
    discountedItems[item] = Math.floor(
      (Math.random() * (MAX_DISCOUNT - MIN_DISCOUNT) + MIN_DISCOUNT) * 100,
    ) / 100;

    // izņem no saraksta nocenoto mantu
    discountableItems.splice(index, 1);
  }

  return discountedItems;
}