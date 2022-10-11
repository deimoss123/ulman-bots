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
  description:
    'Nopirkt kādu preci no veikalā pieejamām precēm\n' +
    'Preces iespējams nopirkt arī caur veikalu (komanda `/veikals`)\n\n' +
    'Ja neievadīsi preces daudzumu komandā, tad tiks nopirkta 1 prece',
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
    if (!itemToBuy) return i.reply(wrongKeyEmbed);

    if (!itemToBuy.categories.includes(ItemCategory.VEIKALS)) {
      return i.reply(
        ephemeralReply(
          `**${itemString(itemToBuy)}** nav ` + (itemToBuy.isVirsiesuDzimte ? 'nopērkams' : 'nopērkama') + ' veikalā'
        )
      );
    }

    await pirktRun(i, itemToBuyKey, amount, this.color);
  },
};

export default pirkt;
