import { ApplicationCommandOptionType } from 'discord.js';
import errorEmbed from '../../../embeds/errorEmbed';
import Command from '../../../interfaces/Command';
import intReply from '../../../utils/intReply';
import _addItemAutocomplete from '../_addItem/_addItemAutocomplete';
import izsoleCreate from './izsoleCreate';
import izsoleList from './IzsoleList';
import izsolesDelete from './izsolesDelete';

const izsole: Command = {
  description: '',
  color: 0xffffff,
  data: {
    name: 'izsole',
    description: 'izsole',
    options: [
      {
        name: 'create',
        description: 'Izveidot jaunu izsoli',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'name',
            description: 'Mantas nosaukums',
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: true,
          },
          {
            name: 'start_price',
            description: 'Sākuma cena',
            type: ApplicationCommandOptionType.Integer,
            min_value: 1,
            required: true,
          },
          {
            name: 'start_date',
            description: 'Sākuma datums (diena/mēnesis stunda:minūte - "18/11 18:00")',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: 'end_date',
            description: 'Beigu datums (diena/mēnesis stunda:minūte - "18/11 18:00")',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: 'amount',
            description: 'Mantas daudzums',
            type: ApplicationCommandOptionType.Integer,
            min_value: 1,
          },
        ],
      },
      {
        name: 'delete',
        description: 'Izdzēst izsoli',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'id',
            description: 'Izsoles id',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: 'list',
        description: 'Saraksts ar izsolēm',
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
  autocomplete: _addItemAutocomplete,
  async run(i) {
    const subCommandName = i.options.getSubcommand();
    if (!subCommandName) return intReply(i, errorEmbed);

    switch (subCommandName) {
      case 'create':
        izsoleCreate(i);
        break;
      case 'delete':
        izsolesDelete(i);
        break;
      case 'list':
        izsoleList(i);
        break;
    }
  },
};

export default izsole;
