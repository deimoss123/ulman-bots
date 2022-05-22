import generateDiscounts from './generateDiscounts';
import * as fs from 'fs';
import { DISCOUNTS_FILE_PATH } from './createDiscounts';

// iestata atlaides
export default function setDiscounts() {
  const discounts = generateDiscounts();
  fs.writeFileSync(DISCOUNTS_FILE_PATH, JSON.stringify(discounts, null, 2));

  console.log('discounts reset');
}