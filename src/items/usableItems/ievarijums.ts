import { UsableItemFunc } from '../../interfaces/Item';
import { BerryProperties } from './oga';

/* 
Ievārījumiem vērtībā tiek rēķināta izmantojot 6 vektoru telpu
Katrai ogai ir 4 īpašības - [skābums, saldums, rūgtums, slapjums]
Katrs vektors ir starp 0 un 100
Tiek izvēlēts viens punkts šajā telpā, jo ievārījuma īpašības ir tuvāk šim punktam, jo ievārījums ir vērtīgāks
*/

// punkts testēšanai
// const punkts = [10, 24, 51, 13];
const punkts = [10, 6, 14, 4];

const punktsObj = {
  saldums: punkts[0],
  skabums: punkts[1],
  rugtums: punkts[2],
  slapjums: punkts[3],
};

const MAX_POSSIBLE_DISTANCE = 775;
const BASE_VALUE = 100;

export function calcIevarijumsPrice(properties: BerryProperties) {
  // prettier-ignore
  const distance = Math.sqrt(
    (properties.saldums - punktsObj.saldums) ** 2 + 
    (properties.skabums - punktsObj.skabums) ** 2 + 
    (properties.rugtums - punktsObj.rugtums) ** 2 + 
    (properties.slapjums - punktsObj.slapjums) ** 2,
  );

  const value = Math.floor((9 * (1 - distance / MAX_POSSIBLE_DISTANCE) ** 16 + 1) * BASE_VALUE);

  return { distance, value, normalizedDistance: 1 - distance / MAX_POSSIBLE_DISTANCE };
}

const ievarijums: UsableItemFunc = (userId, guildId, _, specialItem) => {
  return {
    text: `tu izmantoji ievārījumu`,
  };
};

export default ievarijums;
