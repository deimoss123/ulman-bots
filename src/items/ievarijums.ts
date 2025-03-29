import { BerryProperties } from "@/items/shared/oga";
import { item, AttributeItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import { ItemKey } from "@/utils/itemList";

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

type Attributes = {
  properties: BerryProperties;
  ogas: Record<ItemKey, number>;
  distance: number;
};

const ievarijums = item<AttributeItem<Attributes>>({
  info: "", //TODO
  addedInVersion: "4.3",
  nameNomVsk: "ievārījums",
  nameNomDsk: "ievārījumi",
  nameAkuVsk: "ievārījumu",
  nameAkuDsk: "ievārījumus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("ievarijums"), // TODO:
  imgLink: null,
  categories: [ItemCategory.OTHER],
  value: 15,
  defaultAttributes: () => ({
    properties: {
      saldums: 0,
      skabums: 0,
      rugtums: 0,
      slapjums: 0,
    },
    ogas: {},
    distance: 0,
  }),
  displayAttributes: () => "...",
  sortBy: { distance: 1 },
  use: (i) => intReply(i, "TODO"),
});

export default ievarijums;
