import Command from '../../../interfaces/Command';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import ephemeralReply from '../../../embeds/ephemeralReply';
import itemList, { ItemCategory } from '../../../items/itemList';
import itemString from '../../../embeds/helpers/itemString';
import commandColors from '../../../embeds/commandColors';
import pirktRun from './pirktRun';
import pirktAutocomplete from './pirktAutocomplete';
import wrongKeyEmbed from '../../../embeds/wrongKeyEmbed';

const pirkt: Command = {
  title: 'Pirkt',
  description: 'Pirkt preci no veikala',
  color: commandColors.pirkt,
  data: {
    name: 'pirkt',
    description: 'Nopirkt preci no veikala',
    options: [
      {
        name: 'nosaukums',
        description: 'Prece ko vēlies nopirkt',
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
        required: true,
      },
      {
        name: 'daudzums',
        description: 'Cik preces pirkt',
        type: ApplicationCommandOptionType.Integer,
        min_value: 1,
      },
    ],
  },
  autocomplete: pirktAutocomplete,
  async run(i: ChatInputCommandInteraction) {
    const itemToBuyKey = i.options.getString('nosaukums')!;
    const amount = i.options.getInteger('daudzums') ?? 1;

    const itemToBuy = itemList[itemToBuyKey];
    if (!itemToBuy) {
      await i.reply(wrongKeyEmbed);
      return;
    }

    if (!itemToBuy.categories.includes(ItemCategory.VEIKALS)) {
      await i.reply(
        ephemeralReply(
          `**${itemString(itemToBuy)}** nav ` +
            (itemToBuy.isVirsiesuDzimte ? 'nopērkams' : 'nopērkama') +
            ' veikalā'
        )
      );
      return;
    }

    await pirktRun(i, itemToBuyKey, amount, this.color);
  },
};

export default pirkt;
