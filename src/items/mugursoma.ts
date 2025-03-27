import addItems from "@/db/addItems";
import findUser from "@/db/findUser";
import increaseInvCap from "@/db/increaseInvCap";
import { UsableItemFunc, item, UsableItem, ShopItem, ItemCategory } from "@/types/Item";
import emoji from "@/utils/emoji";
import itemList from "@/utils/itemList";
import itemString from "@/utils/strings/itemString";

export const INCREASE_CAP_1 = 100;
export const INV_INCREASE_AMOUNT_1 = 5;

const use: UsableItemFunc = async (userId, guildId) => {
  const user = await findUser(userId, guildId);
  if (!user) return { error: true };

  if (user.itemCap >= INCREASE_CAP_1) {
    return {
      text:
        `Tu esi sasniedzis maksīmālo inventāra ietilpību ko var iegūt izmantojot ` +
        `${itemString(itemList.mugursoma, null, true)}: **${INCREASE_CAP_1}** vietas\n` +
        `Izmanto **${itemString(itemList.divaina_mugursoma, null, true)}** ` +
        `lai iegūtu papildus inventāra vietas`,
    };
  }

  await addItems(userId, guildId, { mugursoma: -1 });
  await increaseInvCap(userId, guildId, INV_INCREASE_AMOUNT_1);

  return {
    text:
      `Inventāra maksimālā ietilpība palielināta ` +
      `no **${user.itemCap}** uz **${user.itemCap + INV_INCREASE_AMOUNT_1}**`,
  };
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
  removedOnUse: false,
  use,
});

export default mugursoma;
