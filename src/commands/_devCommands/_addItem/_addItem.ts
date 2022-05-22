import Command from '../../../interfaces/Command';
import { ApplicationCommandData, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import embedTemplate from '../../../embeds/embedTemplate';
import itemString from '../../../embeds/helpers/itemString';
import addItem from '../../../economy/addItems';
import wrongKeyEmbed from '../../../embeds/wrongKeyEmbed';
import itemList from '../../../items/itemList';
import _addItemAutocomplete from './_addItemAutocomplete';
import _addItemConfig from './_addItemConfig';

const _addItem: Command = {
  title: 'AddItem',
  description: 'Pievienot mantu inventārā',
  color: '#ffffff',
  autocomplete: _addItemAutocomplete,
  config: _addItemConfig,
  async run(i: CommandInteraction) {
    const target = i.options.data[0].user!;
    const itemToAddKey = i.options.data[1].value as string;
    const amountToAdd = i.options.data[2].value as number;

    const itemToAdd = itemList[itemToAddKey];
    if (!itemToAdd) {
      await i.reply(wrongKeyEmbed);
      return;
    }

    await i.reply(embedTemplate({
      i,
      description: `Tu pievienoji <@${target.id}> ${itemString(itemToAdd, amountToAdd, true)}`,
      color: this.color,
    }));

    await addItem(target.id, { [itemToAddKey]: amountToAdd });
  },
};

export default _addItem;