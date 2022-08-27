import { ApplicationCommandOptionType } from 'discord.js';
import findUser from '../../../economy/findUser';
import ephemeralReply from '../../../embeds/ephemeralReply';
import errorEmbed from '../../../embeds/errorEmbed';
import latiString from '../../../embeds/helpers/latiString';
import Command from '../../../interfaces/Command';
import feniksRun from './feniksRun';

const MIN_LIKME = 20;

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
    ],
  },
  async run(i) {
    const user = await findUser(i.user.id);
    if (!user) return i.reply(errorEmbed);

    const { lati } = user;
    if (lati < MIN_LIKME) {
      return i.reply(
        ephemeralReply(`Tev vajag vismaz **${latiString(MIN_LIKME, true)}** lai grieztu aparātu`)
      );
    }

    const subCommandName = i.options.getSubcommand();
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
