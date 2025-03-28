import { item, UsableItem, ItemCategory } from "@/types/Item";
import commandColors from "@/utils/commandColors";
import mainEmbed from "@/utils/embeds/mainEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import izmantotTitle from "@/utils/strings/izmantotTitle";

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
  use: (i) => {
    // prettier-ignore
    return intReply(i, mainEmbed({
      i,
      color: commandColors.izmantot,
      title: izmantotTitle("kafija"),
      description: 
        "Kafija ir izmantojama, kad tev noteiktā dienā ir beigušās strādāšanas reizes\n" +
        "Komandai `/stradat` ir poga `izdzert kafiju` lai strādātu vēlreiz",
    }));
  },
});

export default kafija;
