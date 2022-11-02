import Command from '../../../interfaces/Command';
import { ApplicationCommandOptionType } from 'discord.js';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';
import pardotValidate from './pardotValidate';
import commandColors from '../../../embeds/commandColors';
import pardotAutocomplete from './pardotAutocomplete';
import pardotRun, { pardotEmbed } from './pardotRun';
import addItems from '../../../economy/addItems';
import addLati from '../../../economy/addLati';
import ephemeralReply from '../../../embeds/ephemeralReply';
import setStats from '../../../economy/stats/setStats';

export const PIRKT_PARDOT_NODOKLIS = 0.05;

export function emptyInvEmbed() {
  return ephemeralReply('Tev nav ko pārdot, tev ir tukšs inventārs');
}

const pardot: Command = {
  description:
    'Pārdot kādu noteiktu mantu, nelietojamās mantas, vai visas mantas no sava inventāra\n' +
    'Cenšoties pārdot visas mantas ar komandu `/pardot visas`, tiks parādīts apstiprināšanas dialogs, lai netīšām nepārdotu visu\n' +
    'Visas un nelietojamās mantas ir iespējams pārdot arī caur inventāru (komanda `/inv`)\n\n' +
    '__**Par mantu daudzumu:**__\n' +
    'Mantu daudzums nav jāievada ja vēlies pārdot tikai 1 mantu\n' +
    'Ja daudzums ko pārdot būs ievadīts lielāks nekā tas ir tavā inventārā, tad tiks iedotas visas noteiktās mantas\n' +
    '**Piemērs:** tev ir 14 virves, tu ievadi 99 daudzumu, tiks pārdotas 14 virves\n\n' +
    'Atribūtu mantām pārdošanas daudzums nav jāievada, jo tām ir atsevišķs dialogs lai izvēletos kuras tieši tu vēlies pārdot',
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

    const subCommandName = i.options.getSubcommand();

    if (['neizmantojamās', 'visas'].includes(subCommandName)) {
      pardotRun(i, subCommandName as 'neizmantojamās' | 'visas');
    }

    if (subCommandName === 'pec_nosaukuma') {
      const user = await findUser(userId, guildId);
      if (!user) return i.reply(errorEmbed);

      const itemToSellId = i.options.getString('nosaukums')!;
      const amountToSell = i.options.getInteger('daudzums') ?? 1;

      const validateRes = await pardotValidate(i, user, itemToSellId, amountToSell, this.color);
      if (!validateRes) return;

      const { key, amount, item } = validateRes;
      const soldItemsValue = item.value * amount;
      const itemsToSell = [{ name: key, amount, item }];

      const taxPaid = Math.floor(soldItemsValue * PIRKT_PARDOT_NODOKLIS);

      await Promise.all([
        addItems(userId, guildId, { [key]: -amount }),
        addLati(i.client.user!.id, guildId, taxPaid),
        setStats(userId, guildId, { soldShop: soldItemsValue, taxPaid }),
      ]);

      await addLati(userId, guildId, soldItemsValue), i.reply(pardotEmbed(i, user, itemsToSell, soldItemsValue));
    }
  },
};

export default pardot;
