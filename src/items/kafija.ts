import { item, UsableItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";

const kafija = item<UsableItem>({
  info:
    `Strādāt ir grūti ja esi noguris, izdzer kafiju!\n\n` +
    "Kafija ir izmantojama, kad tev noteiktā dienā ir beigušās strādāšanas reizes\n" +
    "Komandai `/stradat` ir poga `izdzert kafiju` lai strādātu vēlreiz",
  addedInVersion: "4.0",
  nameNomVsk: "kafija",
  nameNomDsk: "kafijas",
  nameAkuVsk: "kafiju",
  nameAkuDsk: "kafijas",
  isVirsiesuDzimte: false,
  emoji: () => emoji("kafija"),
  imgLink: "https://www.ulmanbots.lv/images/items/kafija.png",
  categories: [ItemCategory.OTHER],
  value: 30,
  removedOnUse: false,
  use: () => {
    return {
      text:
        "Kafija ir izmantojama, kad tev noteiktā dienā ir beigušās strādāšanas reizes\n" +
        "Komandai `/stradat` ir poga `izdzert kafiju` lai strādātu vēlreiz",
    };
  },
});

export default kafija;
