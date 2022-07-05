import Command from '../../../interfaces/Command';
import { CommandInteraction } from 'discord.js';
import pardotConfig from './pardotConfig';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';
import embedTemplate from '../../../embeds/embedTemplate';
import ephemeralReply from '../../../embeds/ephemeralReply';
import itemList, { ItemCategory } from '../../../items/itemList';
import itemString from '../../../embeds/helpers/itemString';
import latiString from '../../../embeds/helpers/latiString';
import Item from '../../../interfaces/Item';
import { validateOne } from './pardotValidate';
import addItems from '../../../economy/addItems';
import addLati from '../../../economy/addLati';
import commandColors from '../../../embeds/commandColors';
import pardotAutocomplete from './pardotAutocomplete';

const pardot: Command = {
  title: 'Pārdot',
  description: 'Pārdot mantu no sava inventāra',
  color: commandColors.pardot,
  config: pardotConfig,
  autocomplete: pardotAutocomplete,
  async run(i: CommandInteraction) {
    const user = await findUser(i.user.id);
    if (!user) return i.reply(errorEmbed);

    let itemsToSell: {
      name: string;
      amount: number;
      item: Item;
    }[] = [];

    const { items } = user;

    if (!items.length) {
      return i.reply(ephemeralReply('Tev nav ko pārdot, tev ir tukšs inventārs'));
    }

    // pārdot pēc tipa
    if (i.options.data[0].name === 'pēc_tipa') {
      const typeToSell = i.options.data[0].options?.[0].value;

      itemsToSell = items.map(({ name, amount }) => ({
        name,
        amount,
        item: itemList[name],
      }));

      switch (typeToSell) {
        case 'atkritumi': {
          itemsToSell = itemsToSell.filter((item) =>
            item.item.categories.includes(ItemCategory.ATKRITUMI)
          );
          break;
        }
        case 'zivis': {
          itemsToSell = itemsToSell.filter((item) =>
            item.item.categories.includes(ItemCategory.ZIVIS)
          );
          break;
        }
        case 'visu': {
          // TODO pievienot paziņojumu "VAI TIEŠĀM VĒLIES PĀRDOT VISAS MANTAs"
          break;
        }
      }

      if (!itemsToSell.length) {
        return i.reply(ephemeralReply(`Tev nav ko pārdot tipā: \`${typeToSell}\``));
      }
    }

    // pārdot vienu
    if (i.options.data[0].name === 'vienu') {
      const itemToSellId = i.options.data[0].options![0].value as string;
      const amountToSell = (i.options.data[0].options![1]?.value as number) ?? 1;

      const itemToSell = await validateOne(i, items, itemToSellId, amountToSell);
      if (!itemToSell) return;

      itemsToSell = [
        {
          name: itemToSell.key,
          amount: amountToSell,
          item: itemToSell.item,
        },
      ];
    }

    const soldItemsValue = itemsToSell.reduce(
      (previous, { item, amount }) => previous + item.value * amount,
      0
    );

    const sellObj: Record<string, number> = {};
    itemsToSell.forEach(({ name, amount }) => {
      sellObj[name] = -amount;
    });

    if (!(await addItems(i.user.id, sellObj)) || !(await addLati(i.user.id, soldItemsValue))) {
      return i.reply(errorEmbed);
    }

    await i.reply(
      embedTemplate({
        i,
        color: this.color,
        fields: [
          {
            name: 'Tu pārdevi',
            value: itemsToSell
              .map((item) => `> ${itemString(item.item, item.amount, true)}`)
              .join('\n'),
            inline: false,
          },
          {
            name: 'Tu ieguvi',
            value: latiString(soldItemsValue, true),
            inline: true,
          },
          {
            name: 'Tev tagad ir',
            value: latiString(soldItemsValue + user.lati),
            inline: true,
          },
        ],
      })
    );
  },
};

export default pardot;
