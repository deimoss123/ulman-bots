import Command from '../../../interfaces/Command';
import { CommandInteraction } from 'discord.js';
import embedTemplate from '../../../embeds/embedTemplate';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';
import itemList from '../../../items/itemList';
import latiString from '../../../embeds/helpers/latiString';
import userString from '../../../embeds/helpers/userString';
import countItems from '../../../items/countItems';
import inventarsConfig from './inventarsConfig';

const inventars: Command = {
  title: 'Inventārs',
  description: 'Apskatīt savu vai kāda lietotāja inventāru',
  config: inventarsConfig,
  run: async function(i: CommandInteraction) {
    const target = i.options.data[0]?.user || i.user;

    const targetUser = await findUser(i.guildId!, target.id);
    if (!targetUser) {
      await i.reply(errorEmbed);
      return;
    }

    const { items, itemCap } = targetUser;

    const totalValue = items.reduce(
      (previous, { name, amount }) => previous + (itemList[name].value * amount), 0,
    );

    await i.reply(embedTemplate({
      i,
      title: target.id === i.user.id
        ? 'Tavs inventārs'
        : `${userString(target)} inventārs`,
      description: items.length
        ? `Inventāra vērtība: **${latiString(totalValue)}**\n` +
        `Inventārā ir **${countItems(items)}** mantas no **${itemCap}**`
        : 'Tukšs inventārs :(',
      fields: items.map(({ name, amount }) => (
        {
          name: `${itemList[name].nameNomVsk} x${amount}`,
          value: `Vērtība: ${latiString(itemList[name].value)}`,
          inline: true,
        }
      )),
    }));
  },
};

export default inventars;