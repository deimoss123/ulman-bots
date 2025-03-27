import { statusList } from "@/commands/profils";
import addItems from "@/db/addItems";
import findUser from "@/db/findUser";
import setUser from "@/db/setUser";
import { UsableItemFunc, item, UsableItem, ShopItem, ItemCategory } from "@/types/Item";
import { UserStatus } from "@/types/UserProfile";
import emoji from "@/utils/emoji";

const use: UsableItemFunc = async (userId, guildId) => {
  const user = await findUser(userId, guildId);
  if (!user) return { error: true };

  const { status } = user;
  if (!Object.values(status).find((s) => s >= Date.now())) {
    return {
      text: "Tev nav neviena statusa ko noņemt",
    };
  }

  const newStatus: any = {};
  for (const key of Object.keys(statusList)) {
    newStatus[key] = 0;
  }

  await setUser(userId, guildId, { status: newStatus as UserStatus });
  await addItems(userId, guildId, { piena_spainis: -1 });

  return { text: "Tev tika noņemti visi statusi" };
};

const piena_spainis = item<UsableItem & ShopItem>({
  info: "Izdzerot (izmantojot) šo gardo piena spaini tev tiks noņemti visi statusi",
  addedInVersion: "4.0",
  nameNomVsk: "piena spainis",
  nameNomDsk: "piena spaiņi",
  nameAkuVsk: "piena spaini",
  nameAkuDsk: "piena spaiņus",
  isVirsiesuDzimte: true,
  emoji: () => emoji("piena_spainis"),
  imgLink: "https://www.ulmanbots.lv/images/items/piena_spainis.png",
  categories: [ItemCategory.VEIKALS],
  value: 25,
  allowDiscount: true,
  removedOnUse: false,
  use,
});

export default piena_spainis;
