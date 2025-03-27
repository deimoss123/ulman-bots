import { item, BaseItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const lasis = item<BaseItem>({
  info: "Tu labprāt šo zivi apēstu, bet nejaukais Discord čatbots tev to neļauj darīt",
  addedInVersion: "4.0",
  nameNomVsk: "lasis",
  nameNomDsk: "laši",
  nameAkuVsk: "lasi",
  nameAkuDsk: "lašus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("lasis"),
  imgLink: "https://www.ulmanbots.lv/images/items/lasis.png",
  categories: [ItemCategory.ZIVIS],
  value: 20,
});

export default lasis;
