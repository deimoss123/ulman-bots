import Command from '../../../interfaces/Command';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
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
  data: {
    name: 'pardot',
    description: 'Pārdot lietu no sava inventāra',
    options: [
      {
        name: 'vienu',
        description: 'Pārdot vienu lietu pēc id',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'nosaukums',
            description: 'Lieta ko vēlies pārdot',
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: true,
          },
          {
            name: 'daudzums',
            description: 'Cik daudz lietas vēlies pārdot',
            type: ApplicationCommandOptionType.Integer,
            min_value: 1,
          },
        ],
      },
      {
        name: 'pēc_tipa',
        description: 'Pārdot visas lietas pēc tipa (zivis, atkritumi, utt.)',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'tips',
            description: 'Kāda tipa lietas pārdot',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: 'Atkritumi',
                value: 'atkritumi',
              },
              {
                name: 'Zivis',
                value: 'zivis',
              },
              {
                name: 'Visu',
                value: 'visu',
              },
            ],
          },
        ],
      },
    ],
  },
  autocomplete: pardotAutocomplete,
  async run(i: ChatInputCommandInteraction) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    const user = await findUser(userId, guildId);
    if (!user) return i.reply(errorEmbed);

    const subCommandName = i.options.getSubcommand();

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
    if (subCommandName === 'pēc_tipa') {
      const typeToSell = i.options.getString('tips');

      itemsToSell = items.map(({ name, amount }) => ({
        name,
        amount,
        item: itemList[name]!,
      }));

      switch (typeToSell) {
        case 'atkritumi': {
          itemsToSell = itemsToSell.filter(item =>
            item.item.categories.includes(ItemCategory.ATKRITUMI)
          );
          break;
        }
        case 'zivis': {
          itemsToSell = itemsToSell.filter(item =>
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
    if (subCommandName === 'vienu') {
      const itemToSellId = i.options.getString('nosaukums')!;
      const amountToSell = i.options.getInteger('daudzums') ?? 1;

      const itemToSell = await validateOne(i, user, itemToSellId, amountToSell, this.color);
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

    if (!(await addItems(userId, guildId, sellObj)) || !(await addLati(userId, guildId, soldItemsValue))) {
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
              .map(item => `> ${itemString(item.item, item.amount, true)}`)
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
