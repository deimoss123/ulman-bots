import { item, UsableItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const metalluznis = item<UsableItem>({
  info:
    "Vai tu esi redzējis skaistāku metāla gabalu par šo?!?!??!!\n\n" +
    "Metāllūžņi ir iekļauti dažās tirgus preču cenās, apdomā vai tik tiešām vēlies tos pārdot",
  addedInVersion: "4.0",
  nameNomVsk: "metāllūznis",
  nameNomDsk: "metāllūžņi",
  nameAkuVsk: "metāllūzni",
  nameAkuDsk: "metāllūžņus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("metalluznis"),
  imgLink: "https://www.ulmanbots.lv/images/items/metalluznis.png",
  categories: [ItemCategory.ATKRITUMI],
  value: 10,
  removedOnUse: false,
  use: async () => ({ text: "Metāllūznis ir izmantojams lai nopirktu dažas tirgus preces" }),
});

export default metalluznis;
