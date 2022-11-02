import itemList, { DiscountedItems } from '../itemList';

// atgriež lietas cenu un atlaidi ja tāda ir
export default function getItemPrice(itemKey: string, discounts: DiscountedItems) {
  let itemPrice = itemList[itemKey].value * 2;

  if (discounts[itemKey]) {
    itemPrice *= 1 - discounts[itemKey];
  }

  return {
    price: Math.floor(itemPrice),
    discount: discounts[itemKey] as number | undefined,
  };
}
