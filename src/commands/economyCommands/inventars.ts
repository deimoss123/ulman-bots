import Command from '../../interfaces/Command';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import embedTemplate from '../../embeds/embedTemplate';
import findUser from '../../economy/findUser';
import errorEmbed from '../../embeds/errorEmbed';
import itemList from '../../items/itemList';
import latiString from '../../embeds/helpers/latiString';
import userString from '../../embeds/helpers/userString';
import countItems from '../../items/helpers/countItems';
import commandColors from '../../embeds/commandColors';
import itemString from '../../embeds/helpers/itemString';

const inventars: Command = {
  title: 'Inventārs',
  description: 'Apskatīt savu vai kāda lietotāja inventāru',
  color: commandColors.inventars,
  data: {
    name: 'inv',
    description: 'Apskatīt inventāru',
    options: [
      {
        name: 'lietotājs',
        description: 'Lietotājs kam apskatīt inventāru',
        type: ApplicationCommandOptionType.User,
      },
    ],
  },
  async run(i: ChatInputCommandInteraction) {
    const target = i.options.getUser('lietotājs') || i.user;

    const targetUser = await findUser(target.id);
    if (!targetUser) {
      await i.reply(errorEmbed);
      return;
    }

    const { items, itemCap } = targetUser;

    const totalValue = items.reduce((previous, { name, amount }) => {
      return previous + itemList[name]!.value * amount;
    }, 0);

    await i.reply(
      embedTemplate({
        i,
        title: target.id === i.user.id ? 'Tavs inventārs' : `${userString(target)} inventārs`,
        description: items.length
          ? `Inventāra vērtība: **${latiString(totalValue)}**\n` +
            `Inventārā ir **${countItems(items)}** mantas no **${itemCap}**`
          : 'Tukšs inventārs :(',
        color: this.color,
        fields: items.map(({ name, amount }) => ({
          name: `${itemString(itemList[name]!)} x${amount}`,
          value: `Vērtība: ${latiString(itemList[name]!.value)}`,
          inline: true,
        })),
      })
    );
  },
};

export default inventars;
