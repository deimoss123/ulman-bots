import { ApplicationCommandOptionType, CommandInteraction, EmbedField } from 'discord.js';
import findUser from '../../../economy/findUser';
import embedTemplate from '../../../embeds/embedTemplate';
import ephemeralReply from '../../../embeds/ephemeralReply';
import errorEmbed from '../../../embeds/errorEmbed';
import latiString from '../../../embeds/helpers/latiString';
import Command from '../../../interfaces/Command';
import feniksLaimesti from './feniksLaimesti';
import feniksRun from './feniksRun';

const MIN_LIKME = 20;

function infoEmbed(i: CommandInteraction) {
  const fields: EmbedField[] = [];

  for (const { variations, multiplier, emoji } of Object.values(feniksLaimesti)) {
    const biggestNumLen = `${Math.max(...variations.map((v) => multiplier * v ** 2))}`.length;
    fields.push({
      name: '\u2800',
      value: variations
        .map(
          (v) =>
            `**\`` +
            ' '.repeat(biggestNumLen - `${multiplier * v ** 2}`.length) +
            `${multiplier * v ** 2}x\`** ${emoji.noBorder.repeat(v)}`
        )
        .join('\n'),
      inline: true,
    });
  }

  return embedTemplate({
    i,
    title: 'Feniksa reizinātāji',
    fields,
  });
}

const feniks: Command = {
  title: 'Feniks',
  description: 'Griezt aparātu (slotus)',
  color: 0x36393f,
  data: {
    name: 'feniks',
    description: 'Griezt aparātu (slotus)',
    options: [
      {
        name: 'likme',
        description: 'Griezt aparātu ar noteiktu likmi',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'likme_lati',
            description: 'Ar cik lielu likmi griezt aparātu',
            type: ApplicationCommandOptionType.Integer,
            required: true,
            minValue: MIN_LIKME,
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

    const userId = i.user.id
    const guildId = i.guildId!

    const user = await findUser(userId, guildId);
    if (!user) return i.reply(errorEmbed);

    const { lati } = user;
    if (lati < MIN_LIKME) {
      return i.reply(
        ephemeralReply(`Tev vajag vismaz **${latiString(MIN_LIKME, true)}** lai grieztu aparātu`)
      );
    }

    let likme = 0;

    if (subCommandName === 'virve')
      likme = Math.floor(Math.random() * (lati - MIN_LIKME)) + MIN_LIKME;
    else if (subCommandName === 'viss') likme = lati;
    else if (subCommandName === 'likme') likme = i.options.getInteger('likme_lati')!;

    if (likme < MIN_LIKME) return i.reply(errorEmbed);
    if (likme > lati) {
      return i.reply(
        ephemeralReply(
          `Tu nevari griezt aparātu ar likmi **${latiString(likme)}**\n` +
            `Tev ir **${latiString(lati)}**`
        )
      );
    }

    await feniksRun(i, likme);
  },
};

export default feniks;
