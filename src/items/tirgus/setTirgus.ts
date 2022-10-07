import generateTirgus from './generateTirgus';
import * as fs from 'fs';
import { getTirgusFilePath } from './createTirgus';

export default function setTirgus() {
  const tirgus = generateTirgus();
  fs.writeFileSync(getTirgusFilePath(), JSON.stringify(tirgus, null, 2));

  console.log('tirgus reset');
}
