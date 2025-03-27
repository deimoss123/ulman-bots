import { item, BaseItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";
import itemString from "@/utils/strings/itemString";

const cepta_lidaka = item<BaseItem>({
  info: () =>
    "mmm... pusdienas\n\n" +
    `Šo zivi var iegūt izcepjot **${itemString("lidaka", null, true)}** ` +
    `ar **${itemString("gazes_plits", null, true)}**`,
  addedInVersion: "4.3",
  nameNomVsk: "cepta līdaka",
  nameNomDsk: "ceptas līdakas",
  nameAkuVsk: "ceptu līdaku",
  nameAkuDsk: "ceptas līdakas",
  isVirsiesuDzimte: false,
  emoji: () => emoji("cepta_lidaka"),
  imgLink: null,
  categories: [ItemCategory.ZIVIS],
  value: 50,
});

export default cepta_lidaka;
