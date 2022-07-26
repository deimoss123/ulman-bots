import { ChatInputCommandInteraction } from 'discord.js';
import findUser from '../../../economy/findUser';
import commandColors from '../../../embeds/commandColors';
import errorEmbed from '../../../embeds/errorEmbed';
import Command from '../../../interfaces/Command';

const stradat: Command = {
  title: 'Strādāt',
  description: 'Strādāt darbā un pelnīt naudu',
  color: commandColors.stradat,
  data: {
    name: 'stradat',
    description: 'Strādāt darbā un pelnīt naudu',
  },
  async run(i: ChatInputCommandInteraction) {
    const user = await findUser(i.user.id);
    if (!user) return i.reply(errorEmbed);
  },
};

export default stradat;
