import brivgrieziens, { brivgriezInfo } from "@/items/shared/brivgrieziens";
import { item, UsableItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const brivgriez25 = item<UsableItem>({
  info: brivgriezInfo,
  addedInVersion: "4.0",
  nameNomVsk: "25 latu brīvgrieziens",
  nameNomDsk: "25 latu brīvgriezieni",
  nameAkuVsk: "25 latu brīvgriezienu",
  nameAkuDsk: "25 latu brīvgriezienus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("brivgriez25"),
  imgLink: "https://www.ulmanbots.lv/images/items/brivgriez25.png",
  categories: [ItemCategory.BRIVGRIEZIENS],
  value: 5,
  removedOnUse: false,
  use: brivgrieziens(25),
});

export default brivgriez25;
