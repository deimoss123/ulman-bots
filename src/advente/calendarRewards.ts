import { ItemKey } from '../items/itemList';

const calendarRewards: Record<string, { item: ItemKey; amount: number } | { lati: number }> = {
  '1': { item: 'metalluznis', amount: 3 },
  '2': { item: 'latloto', amount: 2 },
  '3': { item: 'dizloto', amount: 1 },
  '4': { item: 'metalluznis', amount: 4 },
  '5': { item: 'virve', amount: 2 },
  '6': { item: 'metalluznis', amount: 5 },
  '7': { lati: 50 },
  '8': { item: 'latloto', amount: 1 },
  '9': { item: 'metalluznis', amount: 1 },
  '10': { lati: 125 },
  '11': { item: 'latloto', amount: 1 },
  '12': { item: 'metalluznis', amount: 1 },
  '13': { item: 'virve', amount: 4 },
  '14': { item: 'metalluznis', amount: 1 },
  '15': { item: 'metalluznis', amount: 2 },
  '16': { item: 'kakis', amount: 1 },
  '17': { lati: 1000 },
  '18': { item: 'latloto', amount: 5 },
  '19': { item: 'metalluznis', amount: 5 },
  '20': { item: 'metalluznis', amount: 5 },
  '21': { lati: 200 },
  '22': { item: 'metalluznis', amount: 5 },
  '23': { item: 'latloto', amount: 5 },
  '24': { item: 'metalluznis', amount: 5 },
};

export default calendarRewards;
