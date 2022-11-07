import addItems from '../../economy/addItems';
import findUser from '../../economy/findUser';
import increaseInvCap from '../../economy/increaseInvCap';
import itemString from '../../embeds/helpers/itemString';
import { UsableItemFunc } from '../../interfaces/Item';
import itemList from '../itemList';
import { INCREASE_CAP_1 } from './mugursoma';

export const INCREASE_CAP_2 = 200;
export const INV_NCREASE_AMOUNT_2 = 10;

const divaina_mugursoma: UsableItemFunc = async (userId, guildId) => {
  const user = await findUser(userId, guildId);
  if (!user) return { error: true };

  if (user.itemCap < INCREASE_CAP_1) {
    return {
      text:
        `Tu nevari izmantot ${itemString(itemList.divaina_mugursoma, null, true)}, ` +
        `jo neesi sasniedzis **${INCREASE_CAP_1}** inventāra maksimālo ietilpību, ` +
        `ko iegūst izmantojot ${itemString(itemList.mugursoma, null, false)}`,
    };
  }

  if (user.itemCap >= INCREASE_CAP_2) {
    return {
      text:
        `Tu esi sasniedzis maksīmālo inventāra ietilpību ko var iegūt izmantojot ` +
        `${itemString(itemList.divaina_mugursoma, null, true)}: **${INCREASE_CAP_2}** vietas\n`,
    };
  }

  await addItems(userId, guildId, { divaina_mugursoma: -1 });
  await increaseInvCap(userId, guildId, INV_NCREASE_AMOUNT_2);

  return {
    text:
      `Inventāra maksimālā ietilpība palielināta ` +
      `no **${user.itemCap}** uz **${user.itemCap + INV_NCREASE_AMOUNT_2}**`,
  };
};

export default divaina_mugursoma;
