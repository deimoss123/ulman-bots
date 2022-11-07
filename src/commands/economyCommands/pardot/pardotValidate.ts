import UserProfile from '../../../interfaces/UserProfile';
import Item from '../../../interfaces/Item';
import ephemeralReply from '../../../embeds/ephemeralReply';
import itemString from '../../../embeds/helpers/itemString';
import { CommandInteraction } from 'discord.js';
import wrongKeyEmbed from '../../../embeds/wrongKeyEmbed';
import itemList from '../../../items/itemList';
import pardotRunSpecial from './pardotRunSpecial';
import { emptyInvEmbed } from './pardot';

interface PardotValidateReturn {
  key: string;
  amount: number;
  item: Item;
}

const pardotValidate = async (
  i: CommandInteraction,
  user: UserProfile,
  itemToSellKey: string,
  amountToSell: number,
  embedColor: number
): Promise<PardotValidateReturn | undefined> => {
  if (itemToSellKey === 'no-items-inv') {
    await i.reply(emptyInvEmbed());
    return;
  }

  const itemToSell = itemList[itemToSellKey];
  if (!itemToSell) {
    await i.reply(wrongKeyEmbed);
    return;
  }

  if ('notSellable' in itemToSell) {
    await i.reply(ephemeralReply(`**${itemString(itemToSell, null, true)}** nevar pārdot`));
    return;
  }

  const { items, specialItems } = user;

  if ('attributes' in itemToSell) {
    const specialItemsInv = specialItems.filter(item => item.name === itemToSellKey);
    if (!specialItemsInv.length) {
      await i.reply(ephemeralReply(`Tavā inventārā nav **${itemString(itemToSell)}**`));
      return;
    }

    await pardotRunSpecial(i, itemToSellKey, specialItemsInv, embedColor);
    return;
  }

  const itemInInv = items.find(({ name }) => name === itemToSellKey);
  if (!itemInInv) {
    await i.reply(ephemeralReply(`Tavā inventārā nav **${itemString(itemToSell)}**`));
    return;
  }

  return {
    key: itemToSellKey,
    amount: itemInInv.amount < amountToSell ? itemInInv.amount : amountToSell,
    item: itemToSell,
  };
};

export default pardotValidate;
