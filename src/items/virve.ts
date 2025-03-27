import findUser from "@/db/findUser";
import setLati from "@/db/setLati";
import { item, ItemCategory, ShopItem, UsableItem } from "@/types/Item";
import emoji from "@/utils/emoji";

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
  removedOnUse: true,
  use: async (userId, guildId) => {
    const user = await findUser(userId, guildId);
    if (!user) return { error: true };

    if (user.lati < 0) {
      return {
        text: "Tu nevari pakārties, jo tev ir negatīvs latu daudzums (nezinu kā tev tas izdevās)",
      };
    }

    // TODO: pieviento apstiprinājumu

    await setLati(userId, guildId, 0);

    return { text: "Tu pakāries un pazaudēji **visu** savu naudu" };
  },
});

export default virve;
