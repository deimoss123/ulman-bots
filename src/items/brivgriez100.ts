import brivgrieziens, { brivgriezInfo } from "@/items/shared/brivgrieziens";
import { item, UsableItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const brivgriez100 = item<UsableItem>({
  info: brivgriezInfo,
  addedInVersion: "4.0",
  nameNomVsk: "100 latu brīvgrieziens",
  nameNomDsk: "100 latu brīvgriezieni",
  nameAkuVsk: "100 latu brīvgriezienu",
  nameAkuDsk: "100 latu brīvgriezienus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("brivgriez100"),
  imgLink: "https://www.ulmanbots.lv/images/items/brivgriez100.png",
  categories: [ItemCategory.BRIVGRIEZIENS],
  value: 20,
  use: brivgrieziens,
});

export default brivgriez100;
