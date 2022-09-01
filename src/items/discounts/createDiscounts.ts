import * as fs from 'fs';
import generateDiscounts from './generateDiscounts';

export function getDiscountsFilePath() {
  return (
    './' + (process.env.NODE_ENV === 'PROD' ? 'dist' : 'src') + '/items/discounts/discounts.json'
  );
}

// izveido discounts.json failu ja tāds neeksistē
export default function createDiscounts() {
  let fileExists: boolean;
  try {
    fileExists = fs.existsSync(getDiscountsFilePath());
  } catch (e) {
    fileExists = false;
  }

  if (fileExists) return;

  const discounts = generateDiscounts();

  fs.writeFile(getDiscountsFilePath(), JSON.stringify(discounts, null, 2), err => {
    if (err) throw err;
    console.log('discounts.json created');
  });
}
