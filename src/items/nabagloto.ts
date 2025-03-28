import loto, { LotoOptions } from "@/items/shared/loto";
import { item, ItemCategory, LotoItem, UsableItem } from "@/types/Item";
import emoji from "@/utils/emoji";

const lotoOptions: LotoOptions = {
  rows: 2,
  columns: 3,
  scratches: 2,
  minRewards: 3,
  maxRewards: 3,
  rewards: {
    "10_lati": {
      lati: 10,
      emoji: () => emoji("loto_10"),
      chance: "*",
    },
    "15_lati": {
      lati: 15,
      emoji: () => emoji("loto_15"),
      chance: 0.35,
    },
    "25_lati": {
      lati: 25,
      emoji: () => emoji("loto_25"),
      chance: 0.25,
    },
    "100_lati": {
      lati: 100,
      emoji: () => emoji("loto_100"),
      chance: 0.1,
    },
    "2x": {
      multiplier: 2,
      emoji: () => emoji("loto_reiz_2x"),
      chance: 0.25,
    },
  },
  colors: [
    { lati: 200, color: 0xf066ff },
    { lati: 100, color: 0x66ffc2 },
    { lati: 80, color: 0x96ff66 },
    { lati: 40, color: 0xe0ff66 },
    { lati: 20, color: 0xffd166 },
    { lati: 10, color: 0xff8f66 },
    { lati: 0, color: 0xff4230 },
  ],
};

const nabagloto = item<UsableItem & LotoItem>({
  info: "Slapja un netīra loto biļete kuru var atrast uz ietves malas, iespējams iegūt no ubagošanas (`/ubagot`)",
  addedInVersion: "4.3",
  nameNomVsk: "nabagLoto biļete",
  nameNomDsk: "nabagLoto biļetes",
  nameAkuVsk: "nabagLoto biļeti",
  nameAkuDsk: "nabagLoto biļetes",
  isVirsiesuDzimte: false,
  emoji: () => emoji("nabagloto"),
  imgLink: null, // TODO
  categories: [ItemCategory.LOTO],
  value: 10,
  lotoOptions,
  use: loto(lotoOptions),
});

export default nabagloto;
