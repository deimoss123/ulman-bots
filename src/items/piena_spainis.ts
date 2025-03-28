import { statusList } from "@/commands/profils";
import addItems from "@/db/addItems";
import setUser from "@/db/setUser";
import { UsableItemFunc, item, UsableItem, ShopItem, ItemCategory } from "@/types/Item";
import { UserStatus } from "@/types/UserProfile";
import commandColors from "@/utils/commandColors";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mainEmbed from "@/utils/embeds/mainEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import mongoTransaction from "@/utils/mongoTransaction";
import izmantotTitle from "@/utils/strings/izmantotTitle";

const use: UsableItemFunc = async (i, user) => {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const { status } = user;

  if (!Object.values(status).find((s) => s >= Date.now())) {
    return intReply(i, ephemeralReply("Tev nav neviena statusa ko noņemt"));
  }

  const newStatus: any = {};
  for (const key of Object.keys(statusList)) {
    newStatus[key] = 0;
  }

  const { ok } = await mongoTransaction((session) => [
    () => setUser(userId, guildId, { status: newStatus as UserStatus }, session),
    () => addItems(userId, guildId, { piena_spainis: -1 }, session),
  ]);

  if (!ok) return intReply(i, errorEmbed);

  // prettier-ignore
  intReply(i, mainEmbed({
    i,
    color: commandColors.izmantot,
    title: izmantotTitle("piena_spainis"),
    description: "Tev tika noņemti visi statusi",
  }));
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
  use,
});

export default piena_spainis;
