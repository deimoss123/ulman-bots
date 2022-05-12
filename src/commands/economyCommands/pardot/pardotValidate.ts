import { ItemInProfile } from '../../../interfaces/UserProfile';
import Item from '../../../interfaces/Item';
import findItemById from '../../../items/helpers/findItemById';
import wrongIdEmbed from '../../../embeds/wrongIdEmbed';
import ephemeralReply from '../../../embeds/ephemeralReply';
import itemString from '../../../embeds/helpers/itemString';
import { CommandInteraction } from 'discord.js';

interface ValidateOneReturn {
  key: string,
  item: Item
}

export const validateOne = async (
  i: CommandInteraction,
  items: ItemInProfile[],
  itemToSellId: string,
  amountToSell: number,
): Promise<ValidateOneReturn | undefined> => {

  const itemToSell = findItemById(itemToSellId);
  if (!itemToSell) {
    await i.reply(wrongIdEmbed(itemToSellId));
    return;
  }

  const itemInInv = items.find(({ name }) => name === itemToSell.key);
  if (!itemInInv) {
    await i.reply(ephemeralReply(`Tavā inventārā nav **${itemString(itemToSell.item)}**`));
    return;
  }

  if (itemInInv.amount < amountToSell) {
    await i.reply(ephemeralReply(
      `Tu nevari pārdot ${itemString(itemToSell.item, amountToSell, true)}\n` +
      `Tev inventārā ir tikai ${itemString(itemToSell.item, itemInInv.amount)}`,
    ));
    return;
  }

  return itemToSell;
};