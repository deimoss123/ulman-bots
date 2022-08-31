import UsableItemReturn from '../../interfaces/UsableItemReturn';
import increaseInvCap from '../../economy/increaseInvCap';
import findUser from '../../economy/findUser';
import itemString from '../../embeds/helpers/itemString';
import itemList from '../itemList';
import addItems from '../../economy/addItems';

export const INCREASE_CAP_1 = 100;
const INCREASE_AMOUNT = 5;

export default async function mugursoma(userId: string): Promise<UsableItemReturn> {
  const user = await findUser(userId);
  if (!user) {
    return { text: 'UlmaņBota kļūda' };
  }

  if (user.itemCap >= INCREASE_CAP_1) {
    return {
      text:
        `Tu esi sasniedzis maksīmālo inventāra ietilpību ko var iegūt izmantojot ` +
        `${itemString(itemList.mugursoma, null, true)}: **${INCREASE_CAP_1}** vietas\n` +
        `Izmanto **${itemString(itemList.divaina_mugursoma, null, true)}** ` +
        `lai iegūtu papildus inventāra vietas`,
    };
  }

  await addItems(userId, { mugursoma: -1 });
  await increaseInvCap(userId, INCREASE_AMOUNT);

  return {
    text:
      `Inventāra maksimālā ietilpība palielināta ` +
      `no **${user.itemCap}** uz **${user.itemCap + INCREASE_AMOUNT}**`,
  };
}
