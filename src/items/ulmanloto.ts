import loto, { LotoOptions } from "@/items/shared/loto";
import { item, ItemCategory, LotoItem, UsableItem } from "@/types/Item";
import emoji from "@/utils/emoji";

const lotoOptions: LotoOptions = {
  rows: 4,
  columns: 5,
  scratches: 6,
  minRewards: 11,
  maxRewards: 11,
  rewards: {
    "100_lati": {
      lati: 100,
      emoji: () => emoji("loto_100"),
      chance: "*",
    },
    "250_lati": {
      lati: 250,
      emoji: () => emoji("loto_250"),
      chance: 0.25,
    },
    "450_lati": {
      lati: 450,
      emoji: () => emoji("loto_450"),
      chance: 0.15,
    },
    "800_lati": {
      lati: 800,
      emoji: () => emoji("loto_800"),
      chance: 0.08,
    },
    "2x": {
      multiplier: 2,
      emoji: () => emoji("loto_reiz_2x"),
      chance: 0.2,
    },
    "3x": {
      multiplier: 3,
      emoji: () => emoji("loto_reiz_3x"),
      chance: 0.1,
    },
    "5x": {
      multiplier: 5,
      emoji: () => emoji("loto_reiz_5x"),
      chance: 0.02,
    },
  },
  colors: [
    { lati: 4000, color: 0xf066ff },
    { lati: 2000, color: 0x66ffc2 },
    { lati: 1000, color: 0x96ff66 },
    { lati: 400, color: 0xe0ff66 },
    { lati: 200, color: 0xffd166 },
    { lati: 100, color: 0xff8f66 },
    { lati: 0, color: 0xff4230 },
  ],
};

const ulmanloto = item<UsableItem & LotoItem>({
  info: "Reta un ļoti ekskluzīva loto biļete kas garantēs lielu peļņu tās skrāpētājam",
  addedInVersion: "4.3",
  nameNomVsk: "ulmaņLoto biļete",
  nameNomDsk: "ulmaņLoto biļetes",
  nameAkuVsk: "ulmaņLoto biļeti",
  nameAkuDsk: "ulmaņLoto biļetes",
  isVirsiesuDzimte: false,
  emoji: () => emoji("ulmanloto"),
  imgLink: null, // TODO
  categories: [ItemCategory.LOTO],
  value: 500,
  lotoOptions: lotoOptions,
  use: loto(lotoOptions),
});

export default ulmanloto;
