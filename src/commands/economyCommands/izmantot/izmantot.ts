import Command from '../../../interfaces/Command';
import commandColors from '../../../embeds/commandColors';
import { ApplicationCommandOptionType } from 'discord.js';
import ephemeralReply from '../../../embeds/ephemeralReply';
import itemString from '../../../embeds/helpers/itemString';
import izmantotRun from './izmantotRun';
import izmantotAutocomplete from './izmantotAutocomplete';
import itemList from '../../../items/itemList';
import wrongKeyEmbed from '../../../embeds/wrongKeyEmbed';
import { UsableItem } from '../../../interfaces/Item';
import intReply from '../../../utils/intReply';

const izmantot: Command = {
  description:
    'Izmantot kādu (izmantojamu) mantu no inventāra\n\n' +
    'Ja vēlies uzzināt ko dara kāda noteikta manta izmanto komandu `/info`',
  color: commandColors.izmantot,
  autocomplete: izmantotAutocomplete,
  data: {
    name: 'izmantot',
    description: 'Izmantot kādu mantu no inventāra',
    options: [
      {
        name: 'nosaukums',
        description: 'Manta ko izmantot',
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
        required: true,
      },
    ],
  },
  async run(i) {
    const itemToUseKey = i.options.getString('nosaukums')!;

    const itemToUse = itemList[itemToUseKey] as UsableItem;
    if (!itemToUse) return intReply(i, wrongKeyEmbed);

    if (!itemToUse.use) {
      return intReply(
        i,
        ephemeralReply(
          `**${itemString(itemToUse)}** nav ` + (itemToUse.isVirsiesuDzimte ? 'izmantojams' : 'izmantojama')
        )
      );
    }

    izmantotRun(i, itemToUseKey, this.color);
  },
};

export default izmantot;
