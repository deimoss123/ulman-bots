import * as fs from 'fs';
import generateDiscounts from './generateDiscounts';

export const DISCOUNTS_FILE_PATH = './src/items/discounts/discounts.json';

// izveido discounts.json failu ja tāds neeksistē
export default function createDiscounts() {
  let fileExists: boolean;
  try {
    fileExists = fs.existsSync(DISCOUNTS_FILE_PATH);
  } catch (e) {
    fileExists = false;
  }

  if (fileExists) return;

  const discounts = generateDiscounts();

  fs.writeFile(DISCOUNTS_FILE_PATH, JSON.stringify(discounts, null, 2), err => {
    if (err) throw err;
    console.log('discounts.json created');
  });
}