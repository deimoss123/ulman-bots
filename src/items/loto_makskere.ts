import maksekeresData from "@/commands/zvejot/makskeresData";
import makskere, { makskereDisplayAttributes, makskereDynamicValue, makskereSort } from "@/items/shared/makskere";
import { AttributeItem, item, ItemCategory, TirgusItem } from "@/types/Item";
import emoji from "@/utils/emoji";

type Attributes = {
  durability: number;
};

const loto_makskere = item<AttributeItem<Attributes> & TirgusItem>({
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
  dynamicValue: makskereDynamicValue("loto_makskere"),
  tirgusPrice: { items: { latloto: 3, dizloto: 2, brivgriez25: 2, brivgriez50: 1 } },
  defaultAttributes: () => ({
    durability: maksekeresData.loto_makskere.maxDurability,
  }),
  displayAttributes: makskereDisplayAttributes("loto_makskere"),
  sortBy: makskereSort,
  use: makskere,
});

export default loto_makskere;
