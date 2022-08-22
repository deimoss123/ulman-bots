import UserProfile from '../../../interfaces/UserProfile';
import Item from '../../../interfaces/Item';
import ephemeralReply from '../../../embeds/ephemeralReply';
import itemString from '../../../embeds/helpers/itemString';
import { CommandInteraction } from 'discord.js';
import wrongKeyEmbed from '../../../embeds/wrongKeyEmbed';
import itemList from '../../../items/itemList';
import pardotRunSpecial from './pardotRunSpecial';

interface ValidateOneReturn {
  key: string;
  item: Item;
}

export const validateOne = async (
  i: CommandInteraction,
  user: UserProfile,
  itemToSellKey: string,
  amountToSell: number,
  embedColor: number
): Promise<ValidateOneReturn | undefined> => {
  const itemToSell = itemList[itemToSellKey];
  if (!itemToSell) {
    await i.reply(wrongKeyEmbed);
    return;
  }

  const { items, specialItems } = user;

  if (itemToSell.attributes) {
    const specialItemsInv = specialItems.filter((item) => item.name === itemToSellKey);
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

  if (itemInInv.amount < amountToSell) {
    await i.reply(
      ephemeralReply(
        `Tu nevari pārdot ${itemString(itemToSell, amountToSell, true)}\n` +
          `Tev inventārā ir tikai ${itemString(itemToSell, itemInInv.amount)}`
      )
    );
    return;
  }

  return {
    key: itemToSellKey,
    item: itemToSell,
  };
};
