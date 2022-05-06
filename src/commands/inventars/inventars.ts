import Command from '../../interfaces/Command';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { CommandInteraction } from 'discord.js';
import embedTemplate from '../../embeds/embedTemplate';
import findUser from '../../economy/findUser';
import errorEmbed from '../../embeds/errorEmbed';
import itemList from '../../items/itemList';
import latiString from '../../embeds/stringFunctions/latiString';
import userString from '../../embeds/stringFunctions/userString';

const inventars: Command = {
  title: 'Inventārs',
  description: 'Apskatīt savu vai kāda lietotāja inventāru',
  config: {
    name: 'inv',
    description: 'Apskatīt inventāru',
    options: [
      {
        name: 'lietotājs',
        description: 'Lietotājs kam apskatīt inventāru',
        type: ApplicationCommandOptionTypes.USER,
      },
    ],
  },
  async run(i: CommandInteraction) {
    const target = i.options.data[0]?.user || i.user;

    const targetUser = await findUser(i.guildId!, target.id);
    if (!targetUser) {
      await i.reply(errorEmbed);
      return;
    }

    const { items } = targetUser;

    const totalValue = items.reduce((previous, { name, amount }) => {
      return previous + (itemList[name].value * amount);
    }, 0);

    await i.reply(embedTemplate({
      i,
      title: target.id === i.user.id
        ? 'Tavs inventārs'
        : `${userString(target)} inventārs`,
      description: items.length
        ? `Inventāra vērtība: ${latiString(totalValue)}`
        : 'Tukšs inventārs :(',
      fields: items.map(({ name, amount }) => {
        return {
          name: `${itemList[name].nameNomVsk} x${amount}`,
          value: `Vērtība: ${latiString(itemList[name].value)}`,
          inline: true,
        };
      }),
    }));
  },
};

export default inventars;