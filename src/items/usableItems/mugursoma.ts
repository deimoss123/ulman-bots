import increaseInvCap from "@/db/increaseInvCap";
import findUser from "@/db/findUser";
import itemString from "@/utils/strings/itemString";
import itemList from "@/items/itemList";
import addItems from "@/db/addItems";
import { UsableItemFunc } from "@/types/Item";

export const INCREASE_CAP_1 = 100;
export const INV_INCREASE_AMOUNT_1 = 5;

const mugursoma: UsableItemFunc = async (userId, guildId) => {
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

export default mugursoma;
