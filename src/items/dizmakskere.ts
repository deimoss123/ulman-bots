import maksekeresData from "@/commands/zvejot/makskeresData";
import makskere, { makskereDisplayAttributes, makskereDynamicValue } from "@/items/shared/makskere";
import { AttributeItem, item, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

type Attributes = {
  durability: number;
};

const dizmakskere = item<AttributeItem<Attributes>>({
  info:
    "UlmaņBota veidotājs rakstot šo aprakstu aizmirsa kāpēc dižmakšķere eksistē...\n\n" +
    "Dižmakšķere var nocopēt tikai un vienīgi vērtīgas mantas, tajā skaitā visas mantas kas nopērkamas tirgū\n",
  addedInVersion: "4.0",
  nameNomVsk: "dižmakšķere",
  nameNomDsk: "dižmakšķeres",
  nameAkuVsk: "dižmakšķeri",
  nameAkuDsk: "dižmakšķeres",
  isVirsiesuDzimte: false,
  emoji: () => emoji("dizmakskere"),
  imgLink: "https://www.ulmanbots.lv/images/items/dizmakskere.gif",
  categories: [ItemCategory.MAKSKERE],
  value: 500,
  dynamicValue: makskereDynamicValue("dizmakskere"),
  defaultAttributes: () => ({
    durability: maksekeresData.dizmakskere.maxDurability,
  }),
  displayAttributes: makskereDisplayAttributes("dizmakskere"),
  sortBy: { durability: 1 },
  use: makskere,
});

export default dizmakskere;
