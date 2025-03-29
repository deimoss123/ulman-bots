import maksekeresData from "@/commands/zvejot/makskeresData";
import makskere, { makskereDisplayAttributes, makskereDynamicValue } from "@/items/shared/makskere";
import { AttributeItem, item, ItemCategory, ShopItem } from "@/types/Item";
import emoji from "@/utils/emoji";

type Attributes = {
  durability: number;
};

const divaina_makskere = item<AttributeItem<Attributes> & ShopItem>({
  info:
    "Koka makšķere ir pārāk lēna?\nTā pārāk bieži lūzt?\nNenes pietiekami lielu pelņu?\n" +
    "Tad ir laiks investēt dīvainajā maksķerē!!!",
  addedInVersion: "4.0",
  nameNomVsk: "dīvainā makšķere",
  nameNomDsk: "dīvainās makšķeres",
  nameAkuVsk: "dīvaino makšķeri",
  nameAkuDsk: "dīvainās makšķeres",
  isVirsiesuDzimte: false,
  emoji: () => emoji("divaina_makskere"),
  imgLink: "https://www.ulmanbots.lv/images/items/divaina_makskere.gif",
  categories: [ItemCategory.VEIKALS, ItemCategory.MAKSKERE],
  value: 450,
  dynamicValue: makskereDynamicValue("divaina_makskere"),
  defaultAttributes: () => ({
    durability: maksekeresData.divaina_makskere.maxDurability,
  }),
  displayAttributes: makskereDisplayAttributes("divaina_makskere"),
  sortBy: { durability: 1 },
  allowDiscount: true,
  use: makskere,
});

export default divaina_makskere;
