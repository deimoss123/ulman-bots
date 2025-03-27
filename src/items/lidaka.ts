import { item, BaseItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const lidaka = item<BaseItem>({
  info: "Uz šo zivi skatīties nav ieteicams kamēr esi darbā...",
  addedInVersion: "4.0",
  nameNomVsk: "līdaka",
  nameNomDsk: "līdakas",
  nameAkuVsk: "līdaku",
  nameAkuDsk: "līdakas",
  isVirsiesuDzimte: false,
  emoji: () => emoji("lidaka"),
  imgLink: "https://www.ulmanbots.lv/images/items/lidaka.png",
  categories: [ItemCategory.ZIVIS],
  value: 10,
});

export default lidaka;
