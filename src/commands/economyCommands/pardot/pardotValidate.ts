import UserProfile from '../../../interfaces/UserProfile';
import Item from '../../../interfaces/Item';
import ephemeralReply from '../../../embeds/ephemeralReply';
import itemString from '../../../embeds/helpers/itemString';
import { ChatInputCommandInteraction } from 'discord.js';
import wrongKeyEmbed from '../../../embeds/wrongKeyEmbed';
import itemList from '../../../items/itemList';
import pardotRunSpecial from './pardotRunSpecial';
import { emptyInvEmbed } from './pardot';
import intReply from '../../../utils/intReply';

interface PardotValidateReturn {
  key: string;
  amount: number;
  item: Item;
}

const pardotValidate = async (
  i: ChatInputCommandInteraction,
  user: UserProfile,
  itemToSellKey: string,
  amountToSell: number,
  embedColor: number
): Promise<PardotValidateReturn | undefined> => {
  if (itemToSellKey === 'no-items-inv') {
    await intReply(i, emptyInvEmbed());
    return;
  }

  const itemToSell = itemList[itemToSellKey];
  if (!itemToSell) {
    await intReply(i, wrongKeyEmbed);
    return;
  }

  if ('notSellable' in itemToSell) {
    await intReply(i, ephemeralReply(`**${itemString(itemToSell, null, true)}** nevar pārdot`));
    return;
  }

  const { items, specialItems } = user;

  if ('attributes' in itemToSell) {
    const specialItemsInv = specialItems.filter(item => item.name === itemToSellKey);
    if (!specialItemsInv.length) {
      await intReply(i, ephemeralReply(`Tavā inventārā nav **${itemString(itemToSell)}**`));
      return;
    }

    await pardotRunSpecial(i, itemToSellKey, specialItemsInv, embedColor);
    return;
  }

  const itemInInv = items.find(({ name }) => name === itemToSellKey);
  if (!itemInInv) {
    await intReply(i, ephemeralReply(`Tavā inventārā nav **${itemString(itemToSell)}**`));
    return;
  }

  return {
    key: itemToSellKey,
    amount: itemInInv.amount < amountToSell ? itemInInv.amount : amountToSell,
    item: itemToSell,
  };
};

export default pardotValidate;
