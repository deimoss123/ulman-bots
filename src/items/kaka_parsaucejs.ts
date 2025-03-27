import { item, UsableItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";
import itemList from "@/utils/itemList";
import itemString from "@/utils/strings/itemString";

const kaka_parsaucejs = item<UsableItem>({
  info: () =>
    `Ar šo mantu var nomainīt **${itemList.kakis.emoji()} Kaķa** vārdu\n` +
    `Ja tev inventārā ir ${itemString("kaka_parsaucejs", null)}, izmantojot kaķi tev piedāvās nomainīt tā vārdu`,
  addedInVersion: "4.2",
  nameNomVsk: "kaķa pārsaucējs", // TODO: labāks nosaukums
  nameNomDsk: "kaķa pārsaucēji",
  nameAkuVsk: "kaķa pārsaucēju",
  nameAkuDsk: "kaķa pārsaucējus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("kaka_parsaucejs"),
  imgLink: "https://www.ulmanbots.lv/images/items/kaka_parsaucejs.png",
  categories: [ItemCategory.OTHER],
  value: 90,
  removedOnUse: false,
  // eslint-disable-next-line func-names
  use: function () {
    // @ts-ignore
    return { text: this.info() };
  },
});

export default kaka_parsaucejs;
