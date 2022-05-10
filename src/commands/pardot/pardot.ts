import Command from '../../interfaces/Command';
import { CommandInteraction } from 'discord.js';
import pardotConfig from './pardotConfig';
import findUser from '../../economy/findUser';
import errorEmbed from '../../embeds/errorEmbed';
import embedTemplate from '../../embeds/embedTemplate';
import ephemeralReply from '../../embeds/ephemeralReply';
import Item from '../../interfaces/Item';
import itemList, { ItemCategory } from '../../items/itemList';
import itemString from '../../embeds/helpers/itemString';
import latiString from '../../embeds/helpers/latiString';

const pardot: Command = {
  title: 'Pārdot',
  description: 'Pārdot mantu no sava inventāra',
  config: pardotConfig,
  async run(i: CommandInteraction) {
    const user = await findUser(i.guildId!, i.user.id);
    if (!user) {
      await i.reply(errorEmbed);
      return;
    }

    const { items } = user;

    if (!items.length) {
      await i.reply(ephemeralReply('Tev nav ko pārdot, tev ir tukšs inventārs'));
      return;
    }

    // pārdot pēc tipa
    if (i.options.data[0].name === 'pēc_tipa') {
      const typeToSell = i.options.data[0].options?.[0].value;

      let itemsToSell = items.map(({ name, amount }) => (
        {
          name,
          amount,
          item: itemList[name],
        }
      ));

      switch (typeToSell) {
        case 'atkritumi': {
          itemsToSell = itemsToSell.filter(item =>
            item.item.categories.includes(ItemCategory.ATKRITUMI),
          );
          break;
        }
        case 'zivis': {
          itemsToSell = itemsToSell.filter(item =>
            item.item.categories.includes(ItemCategory.ZIVIS),
          );
          break;
        }
        case 'visu': {
          // TODO pievienot paziņojumu "VAI TIEŠĀM VĒLIES PĀRDOT VISAS MANTAs"
          break;
        }
      }

      if (!itemsToSell.length) {
        await i.reply(ephemeralReply(`Tev nav ko pārdot tipā: \`${typeToSell}\``));
        return;
      }

      const soldItemsValue = itemsToSell.reduce(
        (previous, { item, amount }) => previous + item.value * amount, 0,
      );

      console.log(itemsToSell);

      await i.reply(embedTemplate({
        i,
        fields: [
          {
            name: 'Tu pārdevi',
            value: itemsToSell.map(item => `> ${itemString(item.item, item.amount, true)}`).join('\n'),
            inline: false,
          }, {
            name: 'Tu ieguvi',
            value: latiString(soldItemsValue, true),
            inline: true,
          }, {
            name: 'Tev tagad ir',
            value: latiString(soldItemsValue + user.lati),
            inline: true,
          },
        ],
      }));

      // TODO pievienot datubazes funkcijas
    }

    // TODO pārdot vienu
    if (i.options.data[0].name === 'vienu') {
      await i.reply('vienu');
      return;
    }

  },
};

export default pardot;