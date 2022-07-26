import Command from '../../../interfaces/Command';
import commandColors from '../../../embeds/commandColors';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import ephemeralReply from '../../../embeds/ephemeralReply';
import itemString from '../../../embeds/helpers/itemString';
import izmantotRun from './izmantotRun';
import izmantotAutocomplete from './izmantotAutocomplete';
import itemList from '../../../items/itemList';
import wrongKeyEmbed from '../../../embeds/wrongKeyEmbed';

const izmantot: Command = {
  title: 'Izmantot',
  description: 'Izmantot kādu lietu no inventāra',
  color: commandColors.izmantot,
  autocomplete: izmantotAutocomplete,
  data: {
    name: 'izmantot',
    description: 'Izmantot kādu lietu no inventāra',
    options: [
      {
        name: 'nosaukums',
        description: 'Lieta ko izmantot',
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
        required: true,
      },
    ],
  },
  async run(i: ChatInputCommandInteraction) {
    const itemToUseKey = i.options.getString('nosaukums')!;

    const itemToUse = itemList[itemToUseKey];
    if (!itemToUse) {
      await i.reply(wrongKeyEmbed);
      return;
    }

    if (!itemToUse.use) {
      await i.reply(
        ephemeralReply(
          `**${itemString(itemToUse)}** nav ` +
            (itemToUse.isVirsiesuDzimte ? 'izmantojams' : 'izmantojama')
        )
      );
      return;
    }

    await izmantotRun(i, itemToUseKey, this.color);
  },
};

export default izmantot;
