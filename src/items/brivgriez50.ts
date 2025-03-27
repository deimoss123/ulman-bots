import brivgrieziens, { brivgriezInfo } from "@/items/shared/brivgrieziens";
import { item, UsableItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const brivgriez50 = item<UsableItem>({
  info: brivgriezInfo,
  addedInVersion: "4.0",
  nameNomVsk: "50 latu brīvgrieziens",
  nameNomDsk: "50 latu brīvgriezieni",
  nameAkuVsk: "50 latu brīvgriezienu",
  nameAkuDsk: "50 latu brīvgriezienus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("brivgriez50"),
  imgLink: "https://www.ulmanbots.lv/images/items/brivgriez50.png",
  categories: [ItemCategory.BRIVGRIEZIENS],
  value: 10,
  removedOnUse: false,
  use: brivgrieziens(50),
});

export default brivgriez50;
