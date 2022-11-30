import { ItemKey } from '../items/itemList';

const calendarRewards: Record<string, { item: ItemKey; amount: number } | { lati: number }> = {
  '1': { item: 'metalluznis', amount: 3 },
  '2': { item: 'salaveca_cepure', amount: 1 },
  '3': { item: 'latloto', amount: 2 },
  '4': { lati: 0 }, // TODO: piparkūkas
  '5': { item: 'virve', amount: 5 },
  '6': { lati: 125 },
  '7': { item: 'juridiska_zivs', amount: 2 },
  '8': { item: 'brivgriez25', amount: 3 },
  '9': { item: 'salaveca_cepure', amount: 1 },
  '10': { lati: 150 },
  '11': { item: 'dizloto', amount: 1 },
  '12': { item: 'loto_zivs', amount: 1 },
  '13': { item: 'brivgriez50', amount: 3 },
  '14': { lati: 0 }, // TODO: kaķa pārsaucējs
  '15': { lati: 0 }, // TODO: piparkūkas
  '16': { item: 'salaveca_cepure', amount: 1 },
  '17': { lati: 175 },
  '18': { item: 'latloto', amount: 2 },
  '19': { item: 'mugursoma', amount: 2 },
  '20': { lati: 200 },
  '21': { item: 'loto_zivs', amount: 1 },
  '22': { lati: 0 }, // TODO: kaķa pārsaucējs
  '23': { item: 'salaveca_cepure', amount: 1 },
  '24': { item: 'kakis', amount: 1 },
};

export default calendarRewards;
