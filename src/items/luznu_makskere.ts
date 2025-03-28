import maksekeresData from "@/commands/zvejot/makskeresData";
import makskere, { makskereCustomValue } from "@/items/shared/makskere";
import { AttributeItem, item, ItemCategory, TirgusItem } from "@/types/Item";
import emoji from "@/utils/emoji";

type Attributes = {
  durability: number;
};

const luznu_makskere = item<AttributeItem<Attributes> & TirgusItem>({
  info:
    "Ja mīlēsi metāllūžņus, tie visnotaļ mīlēs arī tevi!\n" +
    "Par cik šī makšķere knapi turās kopā, to nav iespējams salabot",
  addedInVersion: "4.0",
  nameNomVsk: "lūžņu makšķere",
  nameNomDsk: "lūžņu makšķeres",
  nameAkuVsk: "lūžņu makšķeri",
  nameAkuDsk: "lūžņu makšķeres",
  isVirsiesuDzimte: false,
  emoji: () => emoji("luznu_makskere"),
  imgLink: "https://www.ulmanbots.lv/images/items/luznu_makskere.png",
  categories: [ItemCategory.TIRGUS, ItemCategory.MAKSKERE],
  value: 100,
  customValue: makskereCustomValue("luznu_makskere"),
  tirgusPrice: { items: { metalluznis: 15 } },
  defaultAttributes: () => ({
    durability: maksekeresData.luznu_makskere.maxDurability,
  }),
  sortBy: { durability: 1 },
  use: makskere,
});

export default luznu_makskere;
