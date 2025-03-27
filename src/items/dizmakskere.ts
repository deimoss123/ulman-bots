import maksekeresData from "@/commands/zvejot/makskeresData";
import makskere, { makskereCustomValue } from "@/items/shared/makskere";
import { AttributeItem, item, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const dizmakskere = item<
  AttributeItem<{
    durability: number;
  }>
>({
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
  customValue: makskereCustomValue("dizmakskere"),
  defaultAttributes: () => ({
    durability: maksekeresData.dizmakskere.maxDurability,
  }),
  sortBy: { durability: 1 },
  use: makskere,
});

export default dizmakskere;
