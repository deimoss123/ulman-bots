import itemList from '../itemList';
import * as fs from 'fs';
import { DISCOUNTS_FILE_PATH } from '../discounts/createDiscounts';
import { DiscountedItems } from '../discounts/generateDiscounts';

export default function getItemPrice(itemKey: string) {
  const discountData = fs.readFileSync(DISCOUNTS_FILE_PATH);

  // @ts-ignore
  const discounts = JSON.parse(discountData) as DiscountedItems;

  let itemPrice = itemList[itemKey].value * 2;

  if (discounts[itemKey]) {
    itemPrice *= (1 - discounts[itemKey]);
  }

  return {
    price: Math.floor(itemPrice),
    discount: discounts[itemKey] as number | undefined,
  };
}