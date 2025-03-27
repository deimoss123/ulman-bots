import { item, BaseItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";
import itemString from "@/utils/strings/itemString";

const cepts_lasis = item<BaseItem>({
  info: () =>
    "mmm... pusdienas\n\n" +
    `Šo zivi var iegūt izcepjot **${itemString("lasis", null, true)}** ` +
    `ar **${itemString("gazes_plits", null, true)}**`,
  addedInVersion: "4.3",
  nameNomVsk: "cepts lasis",
  nameNomDsk: "cepti laši",
  nameAkuVsk: "ceptu lasi",
  nameAkuDsk: "ceptus lašus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("cepts_lasis"),
  imgLink: null,
  categories: [ItemCategory.ZIVIS],
  value: 100,
});

export default cepts_lasis;
