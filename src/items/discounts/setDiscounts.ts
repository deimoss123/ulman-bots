import generateDiscounts from './generateDiscounts';
import * as fs from 'fs';
import { getDiscountsFilePath } from './createDiscounts';

// iestata atlaides
export default function setDiscounts() {
  const discounts = generateDiscounts();
  fs.writeFileSync(getDiscountsFilePath(), JSON.stringify(discounts, null, 2));

  console.log('discounts reset');
}