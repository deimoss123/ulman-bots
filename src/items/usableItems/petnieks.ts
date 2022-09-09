import addItems from '../../economy/addItems';
import editItemAttribute from '../../economy/editItemAttribute';
import findUser from '../../economy/findUser';
import itemString from '../../embeds/helpers/itemString';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import { UsableItemFunc } from '../../interfaces/Item';
import countFreeInvSlots from '../helpers/countFreeInvSlots';
import itemList, { ItemCategory } from '../itemList';

export async function getRandFreeSpin() {
  const spins = Object.keys((await import('../itemList')).default).filter(item =>
    itemList[item].categories.includes(ItemCategory.BRIVGRIEZIENS)
  );

  return spins[Math.floor(Math.random() * spins.length)];
}

export const PETNIEKS_COOLDOWN = 43_200_000;

const petnieks: UsableItemFunc = async (userId, guildId, _, specialItem) => {
  const lastUsed = specialItem!.attributes.lastUsed!;
  if (Date.now() - lastUsed < PETNIEKS_COOLDOWN) {
    return {
      text:
        `Pētnieks tev nevar uzdāvināt brīvgriezienu, jo viņš to vēl nav atradis\n` +
        `Nākamais brīvgrieziens pēc \`${millisToReadableTime(PETNIEKS_COOLDOWN - Date.now() + lastUsed)}\``,
    };
  }

  const user = await findUser(userId, guildId);
  if (!user) return { text: 'Ulmaņbota kļūda' };

  if (!countFreeInvSlots(user)) {
    return {
      text: 'Lai saņemtu brīvgriezienu tev ir nepieciešama vismaz **1** brīva vieta inventārā',
    };
  }

  const itemKey = specialItem!.attributes.foundItemKey!;

  await editItemAttribute(userId, guildId, specialItem!._id!, {
    lastUsed: Date.now(),
    foundItemKey: await getRandFreeSpin(),
  });
  const userAfter = await addItems(userId, guildId, { [itemKey]: 1 });
  if (!userAfter) return { text: 'Ulmaņbota kļūda' };

  return {
    text:
      `Pētnieks tev uzdāvināja ${itemString(itemList[itemKey], 1, true)}\n` +
      `Nākamais brīvgrieziens pēc \`${millisToReadableTime(PETNIEKS_COOLDOWN - 1)}\``,
  };
};

export default petnieks;
