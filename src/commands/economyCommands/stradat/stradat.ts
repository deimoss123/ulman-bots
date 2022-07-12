import { CommandInteraction } from 'discord.js';
import findUser from '../../../economy/findUser';
import commandColors from '../../../embeds/commandColors';
import errorEmbed from '../../../embeds/errorEmbed';
import Command from '../../../interfaces/Command';

const stradat: Command = {
  title: 'Strādāt',
  description: 'Strādāt darbā un pelnīt naudu',
  color: commandColors.stradat,
  config: {
    name: 'stradat',
    description: 'Strādāt darbā un pelnīt naudu',
  },
  async run(i: CommandInteraction) {
    const user = await findUser(i.user.id);
    if (!user) return i.reply(errorEmbed);
  },
};

export default stradat;
