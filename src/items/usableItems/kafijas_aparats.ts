import addItems from '../../economy/addItems';
import editItemAttribute from '../../economy/editItemAttribute';
import findUser from '../../economy/findUser';
import itemString from '../../embeds/helpers/itemString';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import { UsableItemFunc } from '../../interfaces/Item';
import countFreeInvSlots from '../helpers/countFreeInvSlots';
import itemList from '../itemList';

// 24 stundas
export const KAFIJAS_APARATS_COOLDOWN = 86_400_000;

const kafijas_aparats: UsableItemFunc = async (userId, guildId, _, specialItem) => {
  const lastUsed = specialItem!.attributes.lastUsed!;
  if (Date.now() - lastUsed < KAFIJAS_APARATS_COOLDOWN) {
    return {
      text:
        `Tu nevari uztaisīt ${itemString(itemList.kafija, null, true)}, jo tā tiek gatavota\n` +
        `Nākamā kafija pēc \`${millisToReadableTime(KAFIJAS_APARATS_COOLDOWN - Date.now() + lastUsed)}\``,
    };
  }
  const user = await findUser(userId, guildId);
  if (!user) return { text: 'Ulmaņbota kļūda' };

  if (!countFreeInvSlots(user)) {
    return {
      text:
        `Lai uztaisītu **${itemString(itemList.kafija, null, true)}** ` +
        `tev ir nepieciešama vismaz **1** brīva vieta inventārā`,
    };
  }
  await editItemAttribute(userId, guildId, specialItem!._id!, { lastUsed: Date.now() });
  const userAfter = await addItems(userId, guildId, { kafija: 1 });
  if (!userAfter) return { text: 'Ulmaņbota kļūda' };

  const itemCount = userAfter.items.find(item => item.name === 'kafija')?.amount || 1;

  return {
    text: `Nākamā kafija pēc \`${millisToReadableTime(KAFIJAS_APARATS_COOLDOWN - 1)}\``,
    fields: [
      {
        name: 'Tu uztaisīji',
        value: `${itemString(itemList.kafija, 1, true)}`,
        inline: true,
      },
      {
        name: 'Tev tagad ir',
        value: `${itemString(itemList.kafija, itemCount)}`,
        inline: true,
      },
    ],
  };
};

export default kafijas_aparats;
