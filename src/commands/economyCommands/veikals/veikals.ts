import Command from '../../../interfaces/Command';
import { CommandInteraction } from 'discord.js';
import itemList, { ItemCategory } from '../../../items/itemList';
import embedTemplate from '../../../embeds/embedTemplate';
import capitalizeFirst from '../../../embeds/helpers/capitalizeFirst';
import latiString from '../../../embeds/helpers/latiString';
import veikalsConfig from './veikalsConfig';
import commandColors from '../../../embeds/commandColors';
import itemString from '../../../embeds/helpers/itemString';

export const veikals: Command = {
  title: 'Veikals',
  description: 'Atvērt veikalu',
  color: commandColors.veikals,
  config: veikalsConfig,
  async run(i: CommandInteraction) {

    console.log(Object.keys(itemList).sort());

    const shopItems = Object.entries(itemList).filter(
      ([_, value]) => value.categories.includes(ItemCategory.VEIKALS),
    ).sort( // sakārto preces no dārgākajām uz lētākajām
      (a, b) => b[1].value - a[1].value,
    );

    await i.reply(embedTemplate({
      i,
      content: '\u200b',
      title: 'Veikals',
      description: 'Izmanto /pirkt <preces_id>',
      color: this.color,
      fields: shopItems.map(([_, item]) => ({
        name: itemString(item),
        value:
          `Cena: ${latiString(item.value * 2)}\n` +
          `id: \`${item.ids[0]}\``,
        inline: false,
      })),
    }));
  },
};

export default veikals;