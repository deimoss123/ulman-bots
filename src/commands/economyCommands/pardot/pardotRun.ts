import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
} from 'discord.js';
import addItems from '../../../economy/addItems';
import addLati from '../../../economy/addLati';
import findUser from '../../../economy/findUser';
import setUser from '../../../economy/setUser';
import buttonHandler from '../../../embeds/buttonHandler';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import ephemeralReply from '../../../embeds/ephemeralReply';
import errorEmbed from '../../../embeds/errorEmbed';
import { displayAttributes } from '../../../embeds/helpers/displayAttributes';
import itemString from '../../../embeds/helpers/itemString';
import latiString from '../../../embeds/helpers/latiString';
import smallEmbed from '../../../embeds/smallEmbed';
import Item from '../../../interfaces/Item';
import UserProfile, { ItemAttributes } from '../../../interfaces/UserProfile';
import itemList, { ItemKey } from '../../../items/itemList';
import { emptyInvEmbed, PIRKT_PARDOT_NODOKLIS } from './pardot';

interface ItemsToSell {
  name: string;
  amount: number | null;
  item: Item;
  attributes?: ItemAttributes;
}

function pardotVisuComponents(selectedNo = false) {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('pardot_visu_ja')
        .setLabel('Jā')
        .setStyle(selectedNo ? ButtonStyle.Secondary : ButtonStyle.Primary)
        .setDisabled(selectedNo),
      new ButtonBuilder()
        .setCustomId('pardot_visu_ne')
        .setLabel('Nē')
        .setStyle(selectedNo ? ButtonStyle.Success : ButtonStyle.Danger)
        .setDisabled(selectedNo)
    ),
  ];
}

export function pardotEmbed(
  i: ChatInputCommandInteraction | ButtonInteraction,
  user: UserProfile,
  itemsToSell: ItemsToSell[],
  soldItemsValue: number
) {
  return embedTemplate({
    i,
    color: commandColors.pardot,
    title: 'Tu pārdevi',
    description:
      '>>> ' +
      itemsToSell
        .map(
          ({ name, item, amount, attributes }) =>
            `${itemString(item, amount, true, attributes?.customName)}` +
            (attributes ? `\n${displayAttributes({ name, attributes })}` : '')
        )
        .join('\n'),
    fields: [
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
  });
}

export default async function pardotRun(
  i: ChatInputCommandInteraction | ButtonInteraction,
  type: 'neizmantojamās' | 'visas'
) {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const user = await findUser(userId, guildId);
  if (!user) return i.reply(errorEmbed);

  const { items, specialItems } = user;

  if (!items.length && !specialItems.length) {
    return i.reply(emptyInvEmbed());
  }

  if (type === 'neizmantojamās') {
    const unusuableItems = items.filter(item => !itemList[item.name].use);
    if (!unusuableItems.length) {
      return i.reply(ephemeralReply('Tavā inventārā nav neizmantojumu mantu'));
    }

    const soldItemsValue = unusuableItems.reduce((p, c) => p + c.amount * itemList[c.name].value, 0);
    const itemsToSell = unusuableItems.map(({ name, amount }) => ({ name, amount, item: itemList[name] }));

    const itemsToSellObj: Record<ItemKey, number> = {};
    for (const { name, amount } of itemsToSell) itemsToSellObj[name] = -amount;

    await addLati(userId, guildId, soldItemsValue);
    await addLati(i.client.user!.id, guildId, Math.floor(soldItemsValue * PIRKT_PARDOT_NODOKLIS));
    await addItems(userId, guildId, itemsToSellObj);

    return i.reply(pardotEmbed(i, user, itemsToSell, soldItemsValue));
  }

  // visas
  const msg = await i.reply({
    embeds: smallEmbed('Vai tiešām gribi pārdot **VISAS** savas mantas? (bīstami)', commandColors.pardot).embeds,
    components: pardotVisuComponents(),
    fetchReply: true,
  });

  await buttonHandler(
    i,
    'pardot',
    msg,
    async int => {
      if (int.componentType !== ComponentType.Button) return;
      const { customId } = int;

      if (customId === 'pardot_visu_ne') {
        return {
          edit: { components: pardotVisuComponents(true) },
          end: true,
        };
      }

      if (customId === 'pardot_visu_ja') {
        const user = await findUser(userId, guildId);
        if (!user) return { error: true };

        const { lati, items, specialItems } = user;

        if (!items.length && !specialItems.length) {
          return {
            end: true,
            after: async () => {
              await int.reply(emptyInvEmbed());
            },
          };
        }

        const itemsToSell: ItemsToSell[] = [
          ...specialItems.map(({ name, attributes }) => ({ name, amount: null, item: itemList[name], attributes })),
          ...items.map(({ name, amount }) => ({ name, amount, item: itemList[name] })),
        ];

        const soldItemsValue = itemsToSell.reduce((p, { item, amount, attributes }) => {
          return p + (item.customValue ? item.customValue(attributes!) : item.value * (amount || 1));
        }, 0);

        await addLati(i.client.user!.id, guildId, Math.floor(soldItemsValue * PIRKT_PARDOT_NODOKLIS));
        await setUser(userId, guildId, { lati: lati + soldItemsValue, items: [], specialItems: [] });

        return {
          end: true,
          edit: {
            embeds: pardotEmbed(int, user, itemsToSell, soldItemsValue).embeds,
            components: [],
          },
        };
      }
    },
    60000
  );
}
