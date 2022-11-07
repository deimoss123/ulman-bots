import Command from '../../interfaces/Command';
import { ApplicationCommandOptionType } from 'discord.js';
import findUser from '../../economy/findUser';
import embedTemplate from '../../embeds/embedTemplate';
import errorEmbed from '../../embeds/errorEmbed';
import latiString from '../../embeds/helpers/latiString';
import userString from '../../embeds/helpers/userString';
import commandColors from '../../embeds/commandColors';
import intReply from '../../utils/intReply';

const maks: Command = {
  description: 'Apskatīties savu vai kāda lietotāja maku (latu daudzumu)',
  color: commandColors.maks,
  data: {
    name: 'maks',
    description: 'Apskatīties savu vai kāda lietotāja maku (latu daudzumu)',
    options: [
      {
        name: 'lietotājs',
        description: 'Lietotājs kam apskatīt maku',
        type: ApplicationCommandOptionType.User,
      },
    ],
  },
  async run(i) {
    const target = i.options.getUser('lietotājs') ?? i.user;

    const user = await findUser(target.id, i.guildId!);
    if (!user) return intReply(i, errorEmbed);

    let targetText = 'Tev';
    if (target.id === i.client.user?.id) targetText = 'Valsts bankai';
    else if (target.id !== i.user.id) targetText = `${userString(target)}`;

    intReply(
      i,
      embedTemplate({
        i,
        title: 'Maks',
        description: `${targetText} ir ${latiString(user.lati, false, true)}`,
        color: this.color,
      })
    );
  },
};

export default maks;
