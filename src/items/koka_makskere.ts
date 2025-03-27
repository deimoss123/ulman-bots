import maksekeresData from "@/commands/zvejot/makskeresData";
import makskere, { makskereCustomValue } from "@/items/shared/makskere";
import { AttributeItem, item, ItemCategory, ShopItem } from "@/types/Item";
import emoji from "@/utils/emoji";

const koka_makskere = item<
  // prettier-ignore
  AttributeItem<{
    durability: number;
  }> & ShopItem
>({
  info: "Izcila maksķere iesācēju zvejotājiem - lēta un vienmēr pieejama.",
  addedInVersion: "4.0",
  nameNomVsk: "koka makšķere",
  nameNomDsk: "koka makšķeres",
  nameAkuVsk: "koka makšķeri",
  nameAkuDsk: "koka makšķeres",
  isVirsiesuDzimte: false,
  emoji: () => emoji("koka_makskere"),
  imgLink: "https://www.ulmanbots.lv/images/items/kokamakskere.png",
  categories: [ItemCategory.VEIKALS, ItemCategory.MAKSKERE],
  value: 100,
  customValue: makskereCustomValue("koka_makskere"),
  defaultAttributes: () => ({
    durability: maksekeresData.koka_makskere.maxDurability,
  }),
  sortBy: { durability: 1 },
  allowDiscount: true,
  use: makskere,
});

export default koka_makskere;
