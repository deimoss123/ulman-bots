import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedField } from 'discord.js';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import errorEmbed from '../../../embeds/errorEmbed';
import Command from '../../../interfaces/Command';
import { KazinoLikme } from '../rulete/rulete';
import feniksLaimesti from './feniksLaimesti';
import feniksRun from './feniksRun';

export const FENIKS_MIN_LIKME = 20;

function infoEmbed(i: ChatInputCommandInteraction) {
  const fields: EmbedField[] = [];

  for (const { multipliers, emoji } of Object.values(feniksLaimesti)) {
    const longestNum = Object.values(multipliers).reduce((c, p) => (`${p}`.length > c ? `${p}`.length : c), 0);

    fields.push({
      name: '\u2800',
      value: Object.entries(multipliers)
        .map(
          ([n, mult]) =>
            `**\` ` + ' '.repeat(longestNum - `${mult}`.length) + `${mult}x \`** ${emoji.repeat(Number(n))}`
        )
        .join('\n'),
      inline: true,
    });
  }

  return embedTemplate({
    i,
    title: 'Feniksa reizinātāji',
    color: commandColors.feniks,
    fields,
  });
}

const feniks: Command = {
  description:
    'Visiecienītākais veids kā iztērēt visu savu naudu\n\n' +
    'Griez ar noteiktu likmi, vai arī izmanto komandu `/feniks virve` lai grieztu ar nenoteiktu likmi (ļauj liktenim izlemt)\n' +
    'Informāciju par reizinātājiem var uzzināt ar komandu `/feniks laimesti_info`\n\n' +
    '_UlmaņBota veidotājs nav atbildīgs par jebkāda veida azarspēļu atkarības izraisīšanu, ' +
    'kā arī neatbalsta azartspēļu spēlēšanu ar īstu naudu_\n\n' +
    '**Griez atbildīgi!**',
  color: commandColors.feniks,
  data: {
    name: 'feniks',
    description: 'Griezt aparātu (slotus)',
    options: [
      {
        name: '-',
        description: 'Griezt aparātu ar noteiktu likmi',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'likme_lati',
            description: 'Ar cik lielu likmi griezt aparātu',
            type: ApplicationCommandOptionType.Integer,
            required: true,
            minValue: FENIKS_MIN_LIKME,
          },
        ],
      },
      {
        name: 'virve',
        description: 'Griezt aparātu ar nejauši izvēlētu likmi',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'viss',
        description: 'Griezt aparātu ar visu naudu makā',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'laimesti_info',
        description: 'Apskatīt aparāta reizinātājus un laimestus',
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
  async run(i) {
    const subCommandName = i.options.getSubcommand();
    if (subCommandName === 'laimesti_info') {
      return i.reply(infoEmbed(i));
    }

    const likme: KazinoLikme =
      subCommandName === '-' ? i.options.getInteger('likme_lati')! : (subCommandName as 'virve' | 'viss');

    if (likme < FENIKS_MIN_LIKME) return i.reply(errorEmbed);

    feniksRun(i, likme);
  },
};

export default feniks;
