import { item, AttributeItem, TirgusItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const naudas_maiss = item<
  // prettier-ignore
  AttributeItem<{
    latiCollected: number;
  }> & TirgusItem
>({
  info:
    "Kļūt par bankas zagli ir viegli, bet kur liksi nolaupīto naudu?\n\n" +
    "Naudas maiss glabā no Valsts Bankas (UlmaņBota) nozagto naudu, " +
    "un lai zagtu no bankas inventārā ir jābūt vismaz vienam **tukšam** naudas maisam",
  addedInVersion: "4.0",
  nameNomVsk: "naudas maiss",
  nameNomDsk: "naudas maisi",
  nameAkuVsk: "naudas maisu",
  nameAkuDsk: "naudas maisus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("naudas_maiss"),
  imgLink: "https://www.ulmanbots.lv/images/items/naudas_maiss.png",
  categories: [ItemCategory.TIRGUS],
  value: 10,
  // eslint-disable-next-line func-names
  customValue: function ({ latiCollected }) {
    return latiCollected || this.value;
  },
  tirgusPrice: { items: { nazis: 1, zemenu_rasens: 1, juridiska_zivs: 1, divaina_zivs: 1 } },
  defaultAttributes: () => ({
    latiCollected: 0,
  }),
  sortBy: { latiCollected: 1 },
  use: () => ({
    text:
      `Naudas maiss glabā no Valsts bankas (UlmaņBota) nozagto naudu\n\n` +
      "Lai zagtu no valsts bankas izmanto komandu `/zagt @UlmaņBots` un pārliecinies ka tavā inventārā ir **tukšs** naudas maiss",
  }),
});

export default naudas_maiss;
