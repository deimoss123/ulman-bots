import brivgrieziens, { brivgriezInfo } from "@/items/shared/brivgrieziens";
import { item, UsableItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const brivgriez10 = item<UsableItem>({
  info: brivgriezInfo,
  addedInVersion: "4.0",
  nameNomVsk: "10 latu brīvgrieziens",
  nameNomDsk: "10 latu brīvgriezieni",
  nameAkuVsk: "10 latu brīvgriezienu",
  nameAkuDsk: "10 latu brīvgriezienus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("brivgriez10"),
  imgLink: "https://www.ulmanbots.lv/images/items/brivgriez10.png",
  categories: [ItemCategory.BRIVGRIEZIENS],
  value: 2,
  removedOnUse: false,
  use: brivgrieziens(10),
});

export default brivgriez10;
