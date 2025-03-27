import { item, BaseItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";
import itemString from "@/utils/strings/itemString";

const cepts_asaris = item<BaseItem>({
  info: () =>
    "mmm... pusdienas\n\n" +
    `Šo zivi var iegūt izcepjot **${itemString("asaris", null, true)}** ` +
    `ar **${itemString("gazes_plits", null, true)}**`,
  addedInVersion: "4.3",
  nameNomVsk: "cepts asaris",
  nameNomDsk: "cepti asari",
  nameAkuVsk: "ceptu asari",
  nameAkuDsk: "ceptus asarus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("cepts_asaris"),
  imgLink: null,
  categories: [ItemCategory.ZIVIS],
  value: 75,
});

export default cepts_asaris;
