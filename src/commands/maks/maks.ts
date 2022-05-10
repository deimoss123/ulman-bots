import Command from '../../interfaces/Command';
import { ApplicationCommandData, CommandInteraction } from 'discord.js';
import findUser from '../../economy/findUser';
import embedTemplate from '../../embeds/embedTemplate';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import errorEmbed from '../../embeds/errorEmbed';
import latiString from '../../embeds/helpers/latiString';
import userString from '../../embeds/helpers/userString';

const maks: Command = {
  title: 'Maks',
  description: 'Apskatīties savu vai kāda lietotāja maku',
  config: {
    name: 'maks',
    description: 'Apskatīties maku',
    options: [
      {
        name: 'lietotājs',
        description: 'Lietotājs kam apskatīt maku',
        type: ApplicationCommandOptionTypes.USER,
      },
    ],
  } as ApplicationCommandData,
  async run(i: CommandInteraction) {
    const target = i.options.data[0]?.user || i.user;

    const user = await findUser(i.guildId!, target.id);
    if (!user) {
      await i.reply(errorEmbed);
      return;
    }

    let targetText = 'Tev';
    if (target.id === process.env.BOT_ID) targetText = 'Valsts bankai';
    else if (target.id !== i.user.id) targetText = `${userString(target)}`;

    await i.reply(embedTemplate({
      i,
      title: 'Maks',
      description: `${targetText} ir ${latiString(user.lati)}`,
    }));
  },
};

export default maks;