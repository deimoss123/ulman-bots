import Command from '../../../interfaces/Command';
import { CommandInteraction } from 'discord.js';
import ephemeralReply from '../../../embeds/ephemeralReply';
import itemList, { ItemCategory } from '../../../items/itemList';
import itemString from '../../../embeds/helpers/itemString';
import pirktConfig from './pirktConfig';
import commandColors from '../../../embeds/commandColors';
import pirktRun from './pirktRun';
import pirktAutocomplete from './pirktAutocomplete';
import wrongKeyEmbed from '../../../embeds/wrongKeyEmbed';

const pirkt: Command = {
  title: 'Pirkt',
  description: 'Pirkt preci no veikala',
  color: commandColors.pirkt,
  config: pirktConfig,
  autocomplete: pirktAutocomplete,
  async run(i: CommandInteraction) {

    const itemToBuyKey = i.options.data[0].value as string;
    const amount = i.options.data[1]?.value as number ?? 1;

    const itemToBuy = itemList[itemToBuyKey];
    if (!itemToBuy) {
      await i.reply(wrongKeyEmbed);
      return;
    }

    if (!itemToBuy.categories.includes(ItemCategory.VEIKALS)) {
      await i.reply(ephemeralReply(
        `**${itemString(itemToBuy)}** nav ` +
        (itemToBuy.isVirsiesuDzimte ? 'nopērkams' : 'nopērkama') + ' veikalā',
      ));
      return;
    }

    await pirktRun(i, itemToBuyKey, amount, this.color);
  },
};

export default pirkt;