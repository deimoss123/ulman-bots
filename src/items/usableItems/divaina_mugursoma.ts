import addItems from '../../economy/addItems';
import findUser from '../../economy/findUser';
import increaseInvCap from '../../economy/increaseInvCap';
import itemString from '../../embeds/helpers/itemString';
import UsableItemReturn from '../../interfaces/UsableItemReturn';
import itemList from '../itemList';
import { INCREASE_CAP_1 } from './mugursoma';

const INCREASE_CAP_2 = 200;
const INCREASE_AMOUNT = 10;

export default async function divaina_mugursoma(userId: string): Promise<UsableItemReturn> {
  const user = await findUser(userId);
  if (!user) {
    return { text: 'UlmaņBota kļūda' };
  }

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

  await addItems(userId, { divaina_mugursoma: -1 });
  await increaseInvCap(userId, INCREASE_AMOUNT);

  return {
    text:
      `Inventāra maksimālā ietilpība palielināta ` +
      `no **${user.itemCap}** uz **${user.itemCap + INCREASE_AMOUNT}**`,
  };
}
