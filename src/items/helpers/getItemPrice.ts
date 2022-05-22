import itemList from '../itemList';
import * as fs from 'fs';
import { DiscountedItems } from '../discounts/generateDiscounts';
import { getDiscountsFilePath } from '../discounts/createDiscounts';

// atgriež lietas cenu un atlaidi ja tāda ir
export default function getItemPrice(itemKey: string) {
  const discountData = fs.readFileSync(getDiscountsFilePath());

  const discounts = JSON.parse(discountData as any) as DiscountedItems;

  let itemPrice = itemList[itemKey].value * 2;

  if (discounts[itemKey]) {
    itemPrice *= (1 - discounts[itemKey]);
  }

  return {
    price: Math.floor(itemPrice),
    discount: discounts[itemKey] as number | undefined,
  };
}