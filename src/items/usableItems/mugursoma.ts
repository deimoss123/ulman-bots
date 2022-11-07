import increaseInvCap from '../../economy/increaseInvCap';
import findUser from '../../economy/findUser';
import itemString from '../../embeds/helpers/itemString';
import itemList from '../itemList';
import addItems from '../../economy/addItems';
import { UsableItemFunc } from '../../interfaces/Item';

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
