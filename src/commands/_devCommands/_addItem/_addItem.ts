import Command from '../../../interfaces/Command';
import { ApplicationCommandData, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import findItemById from '../../../items/findItemById';
import embedTemplate from '../../../embeds/embedTemplate';
import itemString from '../../../embeds/helpers/itemString';
import addItem from '../../../economy/addItems';
import wrongIdEmbed from '../../../embeds/wrongIdEmbed';

const _addItem: Command = {
  title: 'AddItem',
  description: 'Pievienot mantu inventārā',
  config: {
    name: 'additem',
    description: 'Pievienot mantu inventārā',
    options: [
      {
        name: 'lietotājs',
        description: 'Lietotājs kam pievienot mantu',
        type: ApplicationCommandOptionTypes.USER,
        required: true,
      }, {
        name: 'mantas_id',
        description: 'Kādu mantu pievienot',
        type: ApplicationCommandOptionTypes.STRING,
        required: true,
      }, {
        name: 'daudzums',
        description: 'Cik mantas pievienot',
        type: ApplicationCommandOptionTypes.INTEGER,
        required: true,
      },
    ],
  } as ApplicationCommandData,
  async run(i: CommandInteraction) {
    const target = i.options.data[0].user!;
    const itemToAddId = i.options.data[1].value as string;
    const amountToAdd = i.options.data[2].value as number;

    const itemToAdd = findItemById(itemToAddId);
    if (!itemToAdd) {
      await i.reply(wrongIdEmbed(itemToAddId));
      return;
    }

    await i.reply(embedTemplate({
      i,
      description: `Tu pievienoji <@${target.id}> ${itemString(itemToAdd.item, amountToAdd, true)}`,
    }));

    await addItem(i.guildId!, target.id, { [itemToAdd.key]: amountToAdd });
  },
};

export default _addItem;