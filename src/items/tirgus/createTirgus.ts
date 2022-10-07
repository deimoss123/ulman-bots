import * as fs from 'fs';
import generateTirgus from './generateTirgus';

export function getTirgusFilePath() {
  return './' + (process.env.NODE_ENV === 'PROD' ? 'dist' : 'src') + '/items/tirgus/tirgus.json';
}

export default function createTirgus() {
  let fileExists: boolean;
  try {
    fileExists = fs.existsSync(getTirgusFilePath());
  } catch (e) {
    fileExists = false;
  }

  if (fileExists) return;

  const tirgus = generateTirgus();

  fs.writeFile(getTirgusFilePath(), JSON.stringify(tirgus, null, 2), err => {
    if (err) throw err;
    console.log('tirgus.json created');
  });
}
