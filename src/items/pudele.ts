import { item, BaseItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const pudele = item<BaseItem>({
  info:
    "Šī tik tiešām ir skaista pudele kuru varētu nodot depozīta sistēmā!\n" +
    "Cik žēl, ka taromāts šajā UlmaņBota versijā neeksistē... :^)",
  addedInVersion: "4.0",
  nameNomVsk: "stikla pudele",
  nameNomDsk: "stikla pudeles",
  nameAkuVsk: "stikla pudeli",
  nameAkuDsk: "stikla pudeles",
  isVirsiesuDzimte: false,
  emoji: () => emoji("pudele"),
  imgLink: "https://www.ulmanbots.lv/images/items/pudele.png",
  categories: [ItemCategory.ATKRITUMI],
  value: 10,
});

export default pudele;
