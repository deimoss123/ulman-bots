import maksekeresData from "@/commands/zvejot/makskeresData";
import makskere, { makskereCustomValue } from "@/items/shared/makskere";
import { AttributeItem, item, ItemCategory, TirgusItem } from "@/types/Item";
import emoji from "@/utils/emoji";

const loto_makskere = item<
  // prettier-ignore
  AttributeItem<{
    durability: number;
  }> & TirgusItem
>({
  info:
    "Šī makšķere ir īpaši veidota tieši azartspēļu atkarības cietušajiem\n" +
    "Iegādājies to, ja nevari atturēties no aparāta un loto biļetēm",
  addedInVersion: "4.0",
  nameNomVsk: "loto makšķere",
  nameNomDsk: "loto makšķeres",
  nameAkuVsk: "loto makšķeri",
  nameAkuDsk: "loto makšķeres",
  isVirsiesuDzimte: false,
  emoji: () => emoji("loto_makskere"),
  imgLink: "https://www.ulmanbots.lv/images/items/loto_makskere.gif",
  categories: [ItemCategory.TIRGUS, ItemCategory.MAKSKERE],
  value: 500,
  customValue: makskereCustomValue("loto_makskere"),
  tirgusPrice: { items: { latloto: 3, dizloto: 2, brivgriez25: 2, brivgriez50: 1 } },
  defaultAttributes: () => ({
    durability: maksekeresData.loto_makskere.maxDurability,
  }),
  sortBy: { durability: 1 },
  use: makskere,
});

export default loto_makskere;
