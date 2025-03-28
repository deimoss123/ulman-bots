import addItems from "@/db/addItems";
import increaseInvCap from "@/db/increaseInvCap";
import { UsableItemFunc, item, UsableItem, ShopItem, ItemCategory } from "@/types/Item";
import commandColors from "@/utils/commandColors";
import ephemeralReply from "@/utils/embeds/ephemeralReply";
import errorEmbed from "@/utils/embeds/errorEmbed";
import mainEmbed from "@/utils/embeds/mainEmbed";
import emoji from "@/utils/emoji";
import intReply from "@/utils/intReply";
import mongoTransaction from "@/utils/mongoTransaction";
import itemString from "@/utils/strings/itemString";
import izmantotTitle from "@/utils/strings/izmantotTitle";

export const INCREASE_CAP_1 = 100;
export const INV_INCREASE_AMOUNT_1 = 5;

const use: UsableItemFunc = async (i, user) => {
  const userId = i.user.id;
  const guildId = i.guildId!;

  if (user.itemCap >= INCREASE_CAP_1) {
    // prettier-ignore
    return intReply(i, ephemeralReply(
      `Tu esi sasniedzis maksīmālo inventāra ietilpību ko var iegūt izmantojot ` +
      `${itemString('mugursoma', null, true)}: **${INCREASE_CAP_1}** vietas\n` +
      `Izmanto **${itemString('divaina_mugursoma', null, true)}** ` +
      `lai iegūtu papildus inventāra vietas`,
    ));
  }

  const { ok, values } = await mongoTransaction((session) => [
    () => addItems(userId, guildId, { mugursoma: -1 }, session),
    () => increaseInvCap(userId, guildId, INV_INCREASE_AMOUNT_1, session),
  ]);

  if (!ok) return intReply(i, errorEmbed);

  // prettier-ignore
  return intReply(i, mainEmbed({
    i,
    color: commandColors.izmantot,
    title: izmantotTitle("mugursoma"),
    description: 
      `Inventāra maksimālā ietilpība palielināta ` +
      `no **${user.itemCap}** uz **${values.at(-1)!.itemCap}**`,
  }));
};

const mugursoma = item<UsableItem & ShopItem>({
  info:
    "Inventārs pilns, ||bikses pilnas,|| ko tagad darīt?\n" +
    `Mugursoma palielinās tava inventāra ietilpību par **${INV_INCREASE_AMOUNT_1}** (līdz **${INCREASE_CAP_1}** vietām)`,
  addedInVersion: "4.0",
  nameNomVsk: "mugursoma",
  nameNomDsk: "mugursomas",
  nameAkuVsk: "mugursomu",
  nameAkuDsk: "mugursomas",
  isVirsiesuDzimte: false,
  emoji: () => emoji("mugursoma"),
  imgLink: "https://www.ulmanbots.lv/images/items/mugursoma.png",
  categories: [ItemCategory.VEIKALS],
  value: 175,
  allowDiscount: true,
  use,
});

export default mugursoma;
