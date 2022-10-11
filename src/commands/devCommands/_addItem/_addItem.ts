import Command from '../../../interfaces/Command';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import embedTemplate from '../../../embeds/embedTemplate';
import itemString from '../../../embeds/helpers/itemString';
import addItem from '../../../economy/addItems';
import wrongKeyEmbed from '../../../embeds/wrongKeyEmbed';
import itemList from '../../../items/itemList';
import _addItemAutocomplete from './_addItemAutocomplete';

const _addItem: Command = {
  description: 'Pievienot mantu inventārā',
  color: 0xffffff,
  data: {
    name: 'additem',
    description: 'Pievienot mantu inventārā',
    options: [
      {
        name: 'lietotājs',
        description: 'Lietotājs kam pievienot lietu',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'nosaukums',
        description: 'Kādu lietu pievienot',
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
        required: true,
      },
      {
        name: 'daudzums',
        description: 'Cik lietas pievienot',
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
    ],
  },
  autocomplete: _addItemAutocomplete,
  async run(i: ChatInputCommandInteraction) {
    const target = i.options.getUser('lietotājs')!;
    const itemToAddKey = i.options.getString('nosaukums')!;
    const amountToAdd = i.options.getInteger('daudzums')!;

    const itemToAdd = itemList[itemToAddKey];
    if (!itemToAdd) {
      await i.reply(wrongKeyEmbed);
      return;
    }

    await i.reply(
      embedTemplate({
        i,
        description: `Tu pievienoji <@${target.id}> ${itemString(itemToAdd, amountToAdd, true)}`,
        color: this.color,
      })
    );

    await addItem(target.id, i.guildId!, { [itemToAddKey]: amountToAdd });
  },
};

export default _addItem;
