import Command from '../../../interfaces/Command';
import { ApplicationCommandOptionType } from 'discord.js';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';
import { validateOne } from './pardotValidate';
import commandColors from '../../../embeds/commandColors';
import pardotAutocomplete from './pardotAutocomplete';
import pardotRun, { pardotEmbed } from './pardotRun';
import addItems from '../../../economy/addItems';
import addLati from '../../../economy/addLati';
import ephemeralReply from '../../../embeds/ephemeralReply';
import setStats from '../../../economy/setStats';

export const PIRKT_PARDOT_NODOKLIS = 0.05;

export function emptyInvEmbed() {
  return ephemeralReply('Tev nav ko pārdot, tev ir tukšs inventārs');
}

const pardot: Command = {
  title: 'Pārdot',
  description: 'Pārdot mantu no sava inventāra',
  color: commandColors.pardot,
  data: {
    name: 'pardot',
    description: 'Pārdot mantas no sava inventāra',
    options: [
      {
        name: 'pec_nosaukuma',
        description: 'Pārdot mantu pēc nosaukuma',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'nosaukums',
            description: 'Mantas nosaukums',
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: true,
          },
          {
            name: 'daudzums',
            description: 'Cik daudz mantas vēlies pārdot',
            type: ApplicationCommandOptionType.Integer,
            min_value: 1,
          },
        ],
      },
      {
        name: 'neizmantojamās',
        description: 'Pārdot visas neizmantojamās mantas',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'visas',
        description: 'Pārdot pilnīgi VISAS mantas inventārā (bīstami)',
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
  autocomplete: pardotAutocomplete,
  async run(i) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const user = await findUser(userId, guildId);
    if (!user) return i.reply(errorEmbed);

    const subCommandName = i.options.getSubcommand();

    if (['neizmantojamās', 'visas'].includes(subCommandName)) {
      pardotRun(i, subCommandName as 'neizmantojamās' | 'visas');
    }

    if (subCommandName === 'pec_nosaukuma') {
      const itemToSellId = i.options.getString('nosaukums')!;
      const amountToSell = i.options.getInteger('daudzums') ?? 1;

      const validateRes = await validateOne(i, user, itemToSellId, amountToSell, this.color);
      if (!validateRes) return;

      const { key, amount, item } = validateRes;
      const soldItemsValue = item.value * amount;
      const itemsToSell = [{ name: key, amount, item }];

      const taxPaid = Math.floor(soldItemsValue * PIRKT_PARDOT_NODOKLIS);

      await Promise.all([
        addItems(userId, guildId, { [key]: -amount }),
        addLati(userId, guildId, soldItemsValue),
        addLati(i.client.user!.id, guildId, taxPaid),
        setStats(userId, guildId, { soldShop: soldItemsValue, taxPaid }),
      ]);

      i.reply(pardotEmbed(i, user, itemsToSell, soldItemsValue));
    }
  },
};

export default pardot;
