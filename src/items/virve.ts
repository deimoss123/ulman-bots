import addItems from "@/db/addItems";
import setLati from "@/db/setLati";
import { item, ItemCategory, ShopItem, UsableItem } from "@/types/Item";
import commandColors from "@/utils/commandColors";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mainEmbed from "@/utils/embeds/mainEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import mongoTransaction from "@/utils/mongoTransaction";
import izmantotTitle from "@/utils/strings/izmantotTitle";

const virve = item<UsableItem & ShopItem>({
  info: "Nopērc virvi, ja vienkārši vairs nevari izturēt...\nVirvi izmantot nav ieteicams.",
  addedInVersion: "4.0",
  nameNomVsk: "virve",
  nameNomDsk: "virves",
  nameAkuVsk: "virvi",
  nameAkuDsk: "virves",
  isVirsiesuDzimte: false,
  emoji: () => emoji("virve"),
  imgLink: "https://www.ulmanbots.lv/images/items/virve.png",
  categories: [ItemCategory.VEIKALS],
  value: 10,
  allowDiscount: true,
  use: async (i, user) => {
    const userId = i.user.id;
    const guildId = i.guildId!;

    if (user.lati < 0) {
      // prettier-ignore
      return intReply(i, ephemeralReply(
        "Tu nevari pakārties, jo tev ir negatīvs latu daudzums (nezinu kā tev tas izdevās)"
      ));
    }

    // TODO: pieviento apstiprinājumu

    const { ok } = await mongoTransaction((session) => [
      () => setLati(userId, guildId, 0, session),
      () => addItems(userId, guildId, { virve: -1 }, session),
    ]);

    if (!ok) return intReply(i, errorEmbed);

    // prettier-ignore
    intReply(i, mainEmbed({
      i,
      color: commandColors.izmantot,
      title: izmantotTitle("virve"),
      description: "Tu pakāries un pazaudēji **visu** savu naudu",
    }));
  },
});

export default virve;
