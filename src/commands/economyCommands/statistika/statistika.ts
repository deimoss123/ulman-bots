import { ApplicationCommandOptionType } from 'discord.js';
import findUser from '../../../economy/findUser';
import commandColors from '../../../embeds/commandColors';
import errorEmbed from '../../../embeds/errorEmbed';
import Command from '../../../interfaces/Command';

const statistika: Command = {
  title: 'Statistika',
  description: 'statistika',
  color: commandColors.top,
  data: {
    name: 'statistika',
    description: 'Apskatīt savu, vai kāda cita lietotāja statistiku',
    options: [
      {
        name: 'lietotājs',
        description: 'Lietotājs, kuram apskatīt statistiku',
        type: ApplicationCommandOptionType.User,
      },
    ],
  },
  async run(i) {
    const guildId = i.guildId!;
    const target = i.options.getUser('lietotājs') ?? i.user;

    const user = await findUser(target.id, guildId);
    if (!user) return i.reply(errorEmbed);

    i.reply('statistika');
  },
};

export default statistika;
