import { item, BaseItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const kartona_kaste = item<BaseItem>({
  info: "Kāds šeit iekšā ir dzīvojis...",
  addedInVersion: "4.0",
  nameNomVsk: "kartona kaste",
  nameNomDsk: "kartona kastes",
  nameAkuVsk: "kartona kasti",
  nameAkuDsk: "kartona kastes",
  isVirsiesuDzimte: false,
  emoji: () => emoji("kartona_kaste"),
  imgLink: "https://www.ulmanbots.lv/images/items/kartona_kaste.png",
  categories: [ItemCategory.ATKRITUMI],
  value: 15,
});

export default kartona_kaste;
