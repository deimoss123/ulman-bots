import Command from '../../../interfaces/Command';
import { ApplicationCommandOptionType } from 'discord.js';
import embedTemplate from '../../../embeds/embedTemplate';
import itemString from '../../../embeds/helpers/itemString';
import addItem from '../../../economy/addItems';
import wrongKeyEmbed from '../../../embeds/wrongKeyEmbed';
import itemList from '../../../items/itemList';
import _addItemAutocomplete from './_addItemAutocomplete';
import intReply from '../../../utils/intReply';

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
  async run(i) {
    const target = i.options.getUser('lietotājs')!;
    const itemToAddKey = i.options.getString('nosaukums')!;
    const amountToAdd = i.options.getInteger('daudzums')!;

    const itemToAdd = itemList[itemToAddKey];
    if (!itemToAdd) {
      return intReply(i, wrongKeyEmbed);
    }

    await addItem(target.id, i.guildId!, { [itemToAddKey]: amountToAdd });

    intReply(
      i,
      embedTemplate({
        i,
        description: `Tu pievienoji <@${target.id}> ${itemString(itemToAdd, amountToAdd, true)}`,
        color: this.color,
      })
    );
  },
};

export default _addItem;
