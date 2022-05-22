import { ItemInProfile } from '../../../interfaces/UserProfile';
import Item from '../../../interfaces/Item';
import ephemeralReply from '../../../embeds/ephemeralReply';
import itemString from '../../../embeds/helpers/itemString';
import { CommandInteraction } from 'discord.js';
import wrongKeyEmbed from '../../../embeds/wrongKeyEmbed';
import itemList from '../../../items/itemList';

interface ValidateOneReturn {
  key: string,
  item: Item
}

export const validateOne = async (
  i: CommandInteraction,
  items: ItemInProfile[],
  itemToSellKey: string,
  amountToSell: number,
): Promise<ValidateOneReturn | undefined> => {

  const itemToSell = itemList[itemToSellKey];
  if (!itemToSell) {
    await i.reply(wrongKeyEmbed);
    return;
  }

  const itemInInv = items.find(({ name }) => name === itemToSellKey);
  if (!itemInInv) {
    await i.reply(ephemeralReply(`Tavā inventārā nav **${itemString(itemToSell)}**`));
    return;
  }

  if (itemInInv.amount < amountToSell) {
    await i.reply(ephemeralReply(
      `Tu nevari pārdot ${itemString(itemToSell, amountToSell, true)}\n` +
      `Tev inventārā ir tikai ${itemString(itemToSell, itemInInv.amount)}`,
    ));
    return;
  }

  return {
    key: itemToSellKey,
    item: itemToSell,
  };
};