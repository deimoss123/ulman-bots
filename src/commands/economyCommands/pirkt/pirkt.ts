import Command from '../../../interfaces/Command';
import { CommandInteraction } from 'discord.js';
import findItemById from '../../../items/helpers/findItemById';
import ephemeralReply from '../../../embeds/ephemeralReply';
import { ItemCategory } from '../../../items/itemList';
import itemString from '../../../embeds/helpers/itemString';
import wrongIdEmbed from '../../../embeds/wrongIdEmbed';
import pirktConfig from './pirktConfig';
import commandColors from '../../../embeds/commandColors';
import pirktRun from './pirktRun';
import pirktAutocomplete from './pirktAutocomplete';

const pirkt: Command = {
  title: 'Pirkt',
  description: 'Pirkt preci no veikala',
  color: commandColors.pirkt,
  config: pirktConfig,
  autocomplete: pirktAutocomplete,
  async run(i: CommandInteraction) {

    const itemToBuyId = i.options.data[0].value as string;
    const amount = i.options.data[1]?.value as number ?? 1;

    const itemToBuy = findItemById(itemToBuyId);
    if (!itemToBuy) {
      await i.reply(wrongIdEmbed(itemToBuyId));
      return;
    }

    if (!itemToBuy.item.categories.includes(ItemCategory.VEIKALS)) {
      await i.reply(ephemeralReply(
        `**${itemString(itemToBuy.item)}** nav ` +
        (itemToBuy.item.isVirsiesuDzimte ? 'nopērkams' : 'nopērkama') + ' veikalā',
      ));
      return;
    }

    await pirktRun(i, itemToBuy.key, amount, this.color);
  },
};

export default pirkt;